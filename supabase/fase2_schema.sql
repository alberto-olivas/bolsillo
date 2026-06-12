-- =============================================
-- BOLSILLO — FASE 2: Esquema de base de datos
-- =============================================
-- Cómo usar: pega este SQL en Supabase → SQL Editor → Run
-- Se puede ejecutar varias veces sin error (usa IF NOT EXISTS y OR REPLACE)
-- =============================================


-- =============================================
-- TABLAS
-- (en orden de dependencias: primero las que no tienen FK)
-- =============================================

-- 1. perfiles
-- Espeja los datos de auth.users que necesitamos mostrar en la app.
-- nombre es nullable: NULL significa que el usuario aún no completó su perfil.
CREATE TABLE IF NOT EXISTS public.perfiles (
  id         uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text        NOT NULL,
  nombre     text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. proyectos
-- La tabla raíz. Todo lo demás (categorías, movimientos, etc.) pertenece a un proyecto.
-- codigo_invitacion se genera automáticamente via trigger si tipo = 'compartido'.
CREATE TABLE IF NOT EXISTS public.proyectos (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre            text        NOT NULL,
  tipo              text        NOT NULL CHECK (tipo IN ('personal', 'compartido')),
  codigo_invitacion text        UNIQUE,
  creado_por        uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- 3. miembros_proyecto
-- Tabla pivote usuario ↔ proyecto. Es la base de toda la seguridad RLS.
-- Un usuario puede acceder a los datos de un proyecto solo si aparece aquí.
CREATE TABLE IF NOT EXISTS public.miembros_proyecto (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id uuid        NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rol         text        NOT NULL DEFAULT 'editor' CHECK (rol IN ('editor')),
  joined_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (proyecto_id, user_id)
);

-- 4. categorias
CREATE TABLE IF NOT EXISTS public.categorias (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id uuid        NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
  nombre      text        NOT NULL,
  icono       text        NOT NULL,
  color       text        NOT NULL,
  tipo        text        NOT NULL CHECK (tipo IN ('gasto', 'ingreso')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 5. gastos_fijos
-- Plantillas de gastos/ingresos recurrentes (ej: alquiler el día 1 de cada mes).
CREATE TABLE IF NOT EXISTS public.gastos_fijos (
  id           uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id  uuid          NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
  categoria_id uuid          NOT NULL REFERENCES public.categorias(id) ON DELETE RESTRICT,
  nombre       text          NOT NULL,
  cantidad     numeric(10,2) NOT NULL CHECK (cantidad > 0),
  tipo         text          NOT NULL CHECK (tipo IN ('gasto', 'ingreso')),
  dia_del_mes  integer       NOT NULL CHECK (dia_del_mes BETWEEN 1 AND 31),
  activo       boolean       NOT NULL DEFAULT true,
  created_at   timestamptz   NOT NULL DEFAULT now()
);

-- 6. movimientos
-- Cada gasto o ingreso registrado. El más consultado — tiene índice en fecha.
CREATE TABLE IF NOT EXISTS public.movimientos (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id   uuid          NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
  usuario_id    uuid          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo          text          NOT NULL CHECK (tipo IN ('gasto', 'ingreso')),
  cantidad      numeric(10,2) NOT NULL CHECK (cantidad > 0),
  categoria_id  uuid          NOT NULL REFERENCES public.categorias(id) ON DELETE RESTRICT,
  fecha         date          NOT NULL,
  descripcion   text,
  es_fijo       boolean       NOT NULL DEFAULT false,
  gasto_fijo_id uuid          REFERENCES public.gastos_fijos(id) ON DELETE SET NULL,
  created_at    timestamptz   NOT NULL DEFAULT now()
);

-- 7. pendientes_confirmar
-- Cola mensual: gastos fijos generados para el mes actual, pendientes de revisar.
-- mes_ano usa el formato 'YYYY-MM' (ej: '2026-06').
CREATE TABLE IF NOT EXISTS public.pendientes_confirmar (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id   uuid        NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
  gasto_fijo_id uuid        NOT NULL REFERENCES public.gastos_fijos(id) ON DELETE CASCADE,
  mes_ano       text        NOT NULL,
  estado        text        NOT NULL DEFAULT 'pendiente'
                            CHECK (estado IN ('pendiente', 'confirmado', 'descartado')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (gasto_fijo_id, mes_ano)
);


-- =============================================
-- ÍNDICES
-- Mejoran el rendimiento de las consultas RLS (join implícito contra miembros_proyecto)
-- y de las consultas más frecuentes de la app.
-- =============================================

CREATE INDEX IF NOT EXISTS idx_miembros_proyecto_id  ON public.miembros_proyecto(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_miembros_user_id       ON public.miembros_proyecto(user_id);
CREATE INDEX IF NOT EXISTS idx_categorias_proyecto    ON public.categorias(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_gastos_fijos_proyecto  ON public.gastos_fijos(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_proyecto   ON public.movimientos(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha      ON public.movimientos(fecha);
CREATE INDEX IF NOT EXISTS idx_pendientes_proyecto    ON public.pendientes_confirmar(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_pendientes_mes_ano     ON public.pendientes_confirmar(mes_ano);


-- =============================================
-- FUNCIONES Y TRIGGERS
-- =============================================

-- ----- Trigger 1: crear perfil al registrarse -----
-- Se dispara automáticamente cada vez que alguien crea una cuenta en Supabase Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Crear perfiles para usuarios que ya existían antes de esta migración
INSERT INTO public.perfiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;


-- ----- Función: generar código de invitación único -----
-- Caracteres usados: letras y números sin los ambiguos (0, O, 1, I).
-- Si hay colisión (muy raro), reintenta en bucle hasta encontrar uno libre.
CREATE OR REPLACE FUNCTION public.generar_codigo_invitacion()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars  text    := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  codigo text    := '';
  existe boolean;
BEGIN
  LOOP
    codigo := '';
    FOR i IN 1..6 LOOP
      codigo := codigo || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;

    SELECT EXISTS (
      SELECT 1 FROM public.proyectos WHERE codigo_invitacion = codigo
    ) INTO existe;

    EXIT WHEN NOT existe;
  END LOOP;
  RETURN codigo;
END;
$$;


-- ----- Trigger 2: asignar código al crear proyecto compartido -----
CREATE OR REPLACE FUNCTION public.handle_new_proyecto_codigo()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.tipo = 'compartido' THEN
    NEW.codigo_invitacion := public.generar_codigo_invitacion();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_proyecto_codigo ON public.proyectos;
CREATE TRIGGER on_proyecto_codigo
  BEFORE INSERT ON public.proyectos
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_proyecto_codigo();


-- ----- Trigger 3: añadir al creador como miembro del proyecto -----
-- SECURITY DEFINER: se ejecuta con permisos del sistema, no del usuario,
-- para poder insertar en miembros_proyecto antes de que existan las políticas RLS.
CREATE OR REPLACE FUNCTION public.handle_new_proyecto_miembro()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.miembros_proyecto (proyecto_id, user_id)
  VALUES (NEW.id, NEW.creado_por);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_proyecto_miembro ON public.proyectos;
CREATE TRIGGER on_proyecto_miembro
  AFTER INSERT ON public.proyectos
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_proyecto_miembro();


-- ----- Trigger 4: insertar categorías predefinidas al crear un proyecto -----
-- Los iconos usan nombres de lucide-react (se usarán en Fase 4).
CREATE OR REPLACE FUNCTION public.handle_new_proyecto_categorias()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.categorias (proyecto_id, nombre, icono, color, tipo) VALUES
    (NEW.id, 'Comida',     'utensils',     '#22c55e', 'gasto'),
    (NEW.id, 'Transporte', 'car',          '#3b82f6', 'gasto'),
    (NEW.id, 'Ocio',       'film',         '#a855f7', 'gasto'),
    (NEW.id, 'Vivienda',   'home',         '#f97316', 'gasto'),
    (NEW.id, 'Salud',      'heart',        '#ef4444', 'gasto'),
    (NEW.id, 'Compras',    'shopping-bag', '#ec4899', 'gasto'),
    (NEW.id, 'Ingresos',   'banknote',     '#16a34a', 'ingreso'),
    (NEW.id, 'Otros',      'package',      '#6b7280', 'gasto');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_proyecto_categorias ON public.proyectos;
CREATE TRIGGER on_proyecto_categorias
  AFTER INSERT ON public.proyectos
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_proyecto_categorias();


-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Función helper: ¿es el usuario actual miembro del proyecto dado?
-- SECURITY DEFINER para evitar recursión circular cuando se usa dentro de RLS
-- (de lo contrario, la política de miembros_proyecto llamaría a esta función,
-- que a su vez consultaría miembros_proyecto con RLS activo → bucle infinito).
CREATE OR REPLACE FUNCTION public.es_miembro(p_proyecto_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.miembros_proyecto
    WHERE proyecto_id = p_proyecto_id
      AND user_id = auth.uid()
  );
$$;

-- ---- perfiles ----
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "perfiles: leer todos"
  ON public.perfiles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "perfiles: editar propio"
  ON public.perfiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ---- proyectos ----
ALTER TABLE public.proyectos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proyectos: leer propios"
  ON public.proyectos FOR SELECT TO authenticated
  USING (public.es_miembro(id));

CREATE POLICY "proyectos: crear"
  ON public.proyectos FOR INSERT TO authenticated
  WITH CHECK (creado_por = auth.uid());

CREATE POLICY "proyectos: editar"
  ON public.proyectos FOR UPDATE TO authenticated
  USING (public.es_miembro(id));

CREATE POLICY "proyectos: borrar"
  ON public.proyectos FOR DELETE TO authenticated
  USING (creado_por = auth.uid());

-- ---- miembros_proyecto ----
ALTER TABLE public.miembros_proyecto ENABLE ROW LEVEL SECURITY;

CREATE POLICY "miembros: leer del proyecto"
  ON public.miembros_proyecto FOR SELECT TO authenticated
  USING (public.es_miembro(proyecto_id));

CREATE POLICY "miembros: unirse"
  ON public.miembros_proyecto FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "miembros: salirse"
  ON public.miembros_proyecto FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ---- categorias ----
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categorias: leer"
  ON public.categorias FOR SELECT TO authenticated
  USING (public.es_miembro(proyecto_id));

CREATE POLICY "categorias: crear"
  ON public.categorias FOR INSERT TO authenticated
  WITH CHECK (public.es_miembro(proyecto_id));

CREATE POLICY "categorias: editar"
  ON public.categorias FOR UPDATE TO authenticated
  USING (public.es_miembro(proyecto_id));

CREATE POLICY "categorias: borrar"
  ON public.categorias FOR DELETE TO authenticated
  USING (public.es_miembro(proyecto_id));

-- ---- gastos_fijos ----
ALTER TABLE public.gastos_fijos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gastos_fijos: leer"
  ON public.gastos_fijos FOR SELECT TO authenticated
  USING (public.es_miembro(proyecto_id));

CREATE POLICY "gastos_fijos: crear"
  ON public.gastos_fijos FOR INSERT TO authenticated
  WITH CHECK (public.es_miembro(proyecto_id));

CREATE POLICY "gastos_fijos: editar"
  ON public.gastos_fijos FOR UPDATE TO authenticated
  USING (public.es_miembro(proyecto_id));

CREATE POLICY "gastos_fijos: borrar"
  ON public.gastos_fijos FOR DELETE TO authenticated
  USING (public.es_miembro(proyecto_id));

-- ---- movimientos ----
ALTER TABLE public.movimientos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "movimientos: leer"
  ON public.movimientos FOR SELECT TO authenticated
  USING (public.es_miembro(proyecto_id));

CREATE POLICY "movimientos: crear"
  ON public.movimientos FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid() AND public.es_miembro(proyecto_id));

CREATE POLICY "movimientos: editar"
  ON public.movimientos FOR UPDATE TO authenticated
  USING (public.es_miembro(proyecto_id));

CREATE POLICY "movimientos: borrar"
  ON public.movimientos FOR DELETE TO authenticated
  USING (public.es_miembro(proyecto_id));

-- ---- pendientes_confirmar ----
ALTER TABLE public.pendientes_confirmar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pendientes: leer"
  ON public.pendientes_confirmar FOR SELECT TO authenticated
  USING (public.es_miembro(proyecto_id));

CREATE POLICY "pendientes: crear"
  ON public.pendientes_confirmar FOR INSERT TO authenticated
  WITH CHECK (public.es_miembro(proyecto_id));

CREATE POLICY "pendientes: editar"
  ON public.pendientes_confirmar FOR UPDATE TO authenticated
  USING (public.es_miembro(proyecto_id));

CREATE POLICY "pendientes: borrar"
  ON public.pendientes_confirmar FOR DELETE TO authenticated
  USING (public.es_miembro(proyecto_id));


-- =============================================
-- VERIFICACIÓN (ejecutar después del schema para comprobar que todo está bien)
-- =============================================
-- Puedes pegar estas queries por separado en el SQL Editor para verificar:
--
-- Ver tablas creadas:
--   SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
--
-- Ver triggers creados:
--   SELECT trigger_name, event_object_table FROM information_schema.triggers
--   WHERE trigger_schema = 'public' ORDER BY event_object_table;
--
-- Ver políticas RLS:
--   SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;
--
-- Probar que el perfil del usuario actual existe:
--   SELECT * FROM perfiles;
--
-- Probar creación de proyecto (sustituye con datos reales desde la app en Fase 3,
-- pero puedes probar aquí con tu user_id):
--   INSERT INTO proyectos (nombre, tipo, creado_por)
--   VALUES ('Mi proyecto', 'personal', auth.uid());
--   SELECT * FROM proyectos;
--   SELECT * FROM miembros_proyecto;
--   SELECT * FROM categorias;
