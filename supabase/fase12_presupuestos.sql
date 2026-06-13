-- =============================================
-- BOLSILLO — FASE 12: Sistema de Presupuestos
-- =============================================
-- Ejecutar en Supabase → SQL Editor → Run
-- Es idempotente: se puede ejecutar varias veces sin efectos secundarios.
-- =============================================


-- 1. TABLA
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.presupuestos (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  proyecto_id  uuid        NOT NULL REFERENCES public.proyectos(id)   ON DELETE CASCADE,
  categoria_id uuid        NOT NULL REFERENCES public.categorias(id)  ON DELETE CASCADE,
  limite       numeric(10,2) NOT NULL CHECK (limite > 0),
  es_fijo      boolean     NOT NULL DEFAULT true,
  -- NULL si es_fijo=true (aplica a todos los meses)
  -- 'YYYY-MM' si es_fijo=false (solo para ese mes)
  mes_ano      text,
  activo       boolean     NOT NULL DEFAULT true,
  created_at   timestamptz DEFAULT now()
);


-- 2. ÍNDICES ÚNICOS PARCIALES
-- -----------------------------------------------
-- Solo un presupuesto fijo activo por categoría por proyecto
CREATE UNIQUE INDEX IF NOT EXISTS presupuestos_fijo_unique
  ON public.presupuestos(proyecto_id, categoria_id)
  WHERE es_fijo = true AND activo = true;

-- Solo un presupuesto puntual por categoría por mes por proyecto
-- (puede coexistir con el fijo de la misma categoría sin conflicto)
CREATE UNIQUE INDEX IF NOT EXISTS presupuestos_puntual_unique
  ON public.presupuestos(proyecto_id, categoria_id, mes_ano)
  WHERE es_fijo = false;


-- 3. ROW LEVEL SECURITY
-- -----------------------------------------------
ALTER TABLE public.presupuestos ENABLE ROW LEVEL SECURITY;

-- SELECT: solo miembros del proyecto
CREATE POLICY "Miembros pueden ver presupuestos"
  ON public.presupuestos
  FOR SELECT
  USING (es_miembro(proyecto_id));

-- INSERT: solo miembros del proyecto
CREATE POLICY "Miembros pueden crear presupuestos"
  ON public.presupuestos
  FOR INSERT
  WITH CHECK (es_miembro(proyecto_id));

-- UPDATE: solo miembros del proyecto
CREATE POLICY "Miembros pueden actualizar presupuestos"
  ON public.presupuestos
  FOR UPDATE
  USING (es_miembro(proyecto_id))
  WITH CHECK (es_miembro(proyecto_id));

-- DELETE: solo miembros del proyecto
CREATE POLICY "Miembros pueden eliminar presupuestos"
  ON public.presupuestos
  FOR DELETE
  USING (es_miembro(proyecto_id));
