-- =============================================
-- BOLSILLO — FASE 3: RPC y limpieza de datos de prueba
-- Ejecutar en Supabase SQL Editor
-- =============================================


-- =============================================
-- LIMPIEZA DE DATOS DE PRUEBA (Fase 2)
-- Elimina los proyectos y datos de test creados durante la verificación.
-- ¡Cuidado! Esto borrará TODOS los proyectos existentes.
-- Comenta estas líneas si ya tienes datos reales que conservar.
-- =============================================

DELETE FROM proyectos WHERE nombre IN ('Test personal', 'Test compartido', 'Proyecto test', 'Proyecto compartido test');


-- =============================================
-- FUNCIÓN: unirse_proyecto
-- =============================================
-- Permite a un usuario unirse a un proyecto compartido usando el código de invitación.
--
-- Por qué necesitamos esta función:
-- RLS bloquea el SELECT en proyectos a usuarios que no son miembros.
-- Un usuario que intenta unirse aún no es miembro, así que no puede buscar
-- el proyecto por su código desde el cliente directamente.
-- SECURITY DEFINER hace que la función corra con permisos de postgres,
-- saltándose RLS solo para esta operación concreta y controlada.
--
-- Uso desde el cliente:
--   supabase.rpc('unirse_proyecto', { p_codigo: 'AB3X9K' })
-- Devuelve: el proyecto_id si el código era válido, null si no existe.
-- =============================================

CREATE OR REPLACE FUNCTION public.unirse_proyecto(p_codigo text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_proyecto_id uuid;
BEGIN
  -- Buscar el proyecto compartido con ese código (case-insensitive)
  SELECT id INTO v_proyecto_id
  FROM proyectos
  WHERE codigo_invitacion = upper(p_codigo)
    AND tipo = 'compartido';

  -- Si no existe, devolver null (el frontend mostrará error)
  IF v_proyecto_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Añadir al usuario como miembro. ON CONFLICT DO NOTHING evita error
  -- si el usuario ya era miembro (por si pulsa el botón dos veces).
  INSERT INTO miembros_proyecto (proyecto_id, user_id)
  VALUES (v_proyecto_id, auth.uid())
  ON CONFLICT DO NOTHING;

  RETURN v_proyecto_id;
END;
$$;
