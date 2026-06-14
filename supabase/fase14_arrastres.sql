-- =============================================
-- BOLSILLO — FASE 14: Arrastres de saldo entre meses
-- =============================================
-- Cómo usar: pega este SQL en Supabase → SQL Editor → Run
-- Se puede ejecutar varias veces sin error (usa IF NOT EXISTS)
-- =============================================


-- =============================================
-- TABLA
-- =============================================

-- arrastres_mes
-- Una fila por (proyecto, mes). mes_ano es el mes que RECIBE el arrastre.
-- Ejemplo: mes_ano='2026-01' contiene el saldo de diciembre 2025 ofrecido a enero 2026.
CREATE TABLE IF NOT EXISTS public.arrastres_mes (
  id           uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id  uuid          NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
  mes_ano      text          NOT NULL,
  importe      numeric(10,2) NOT NULL,
  estado       text          NOT NULL DEFAULT 'pendiente'
                             CHECK (estado IN ('pendiente', 'confirmado', 'descartado')),
  created_at   timestamptz   NOT NULL DEFAULT now(),
  UNIQUE (proyecto_id, mes_ano)
);


-- =============================================
-- ÍNDICES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_arrastres_proyecto ON public.arrastres_mes (proyecto_id);
CREATE INDEX IF NOT EXISTS idx_arrastres_mes_ano  ON public.arrastres_mes (mes_ano);


-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE public.arrastres_mes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "arrastres: leer"
  ON public.arrastres_mes FOR SELECT TO authenticated
  USING (public.es_miembro(proyecto_id));

CREATE POLICY "arrastres: crear"
  ON public.arrastres_mes FOR INSERT TO authenticated
  WITH CHECK (public.es_miembro(proyecto_id));

CREATE POLICY "arrastres: editar"
  ON public.arrastres_mes FOR UPDATE TO authenticated
  USING (public.es_miembro(proyecto_id));

CREATE POLICY "arrastres: borrar"
  ON public.arrastres_mes FOR DELETE TO authenticated
  USING (public.es_miembro(proyecto_id));
