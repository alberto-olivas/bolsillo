-- =============================================
-- BOLSILLO — FASE 9: Categorías Ahorro e Inversión
-- =============================================
-- Ejecutar en Supabase → SQL Editor → Run
-- Es idempotente: se puede ejecutar varias veces sin duplicar datos.
-- =============================================

-- 1. Actualizar el trigger para que los proyectos NUEVOS incluyan las categorías
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
    (NEW.id, 'Otros',      'package',      '#6b7280', 'gasto'),
    (NEW.id, 'Ahorro',     'piggy-bank',   '#10b981', 'gasto'),
    (NEW.id, 'Inversión',  'trending-up',  '#8b5cf6', 'gasto');
  RETURN NEW;
END;
$$;

-- 2. Añadir Ahorro a todos los proyectos existentes (WHERE NOT EXISTS = idempotente)
INSERT INTO public.categorias (proyecto_id, nombre, icono, color, tipo)
SELECT p.id, 'Ahorro', 'piggy-bank', '#10b981', 'gasto'
FROM public.proyectos p
WHERE NOT EXISTS (
  SELECT 1 FROM public.categorias c
  WHERE c.proyecto_id = p.id AND c.nombre = 'Ahorro'
);

-- 3. Añadir Inversión a todos los proyectos existentes
INSERT INTO public.categorias (proyecto_id, nombre, icono, color, tipo)
SELECT p.id, 'Inversión', 'trending-up', '#8b5cf6', 'gasto'
FROM public.proyectos p
WHERE NOT EXISTS (
  SELECT 1 FROM public.categorias c
  WHERE c.proyecto_id = p.id AND c.nombre = 'Inversión'
);
