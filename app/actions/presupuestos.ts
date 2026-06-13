'use server'

import { createClient } from '@/lib/supabase/server'

export async function guardarPresupuesto(
  proyectoId: string,
  categoriaId: string,
  limite: number,
  esFijo: boolean,
  mesAno: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  if (esFijo) {
    const { data: existing } = await supabase
      .from('presupuestos')
      .select('id')
      .eq('proyecto_id', proyectoId)
      .eq('categoria_id', categoriaId)
      .eq('es_fijo', true)
      .eq('activo', true)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from('presupuestos').update({ limite }).eq('id', existing.id)
      return error ? { error: error.message } : {}
    }
    const { error } = await supabase.from('presupuestos').insert({
      proyecto_id: proyectoId, categoria_id: categoriaId, limite, es_fijo: true,
    })
    return error ? { error: error.message } : {}
  } else {
    const { data: existing } = await supabase
      .from('presupuestos')
      .select('id')
      .eq('proyecto_id', proyectoId)
      .eq('categoria_id', categoriaId)
      .eq('es_fijo', false)
      .eq('mes_ano', mesAno)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from('presupuestos').update({ limite }).eq('id', existing.id)
      return error ? { error: error.message } : {}
    }
    const { error } = await supabase.from('presupuestos').insert({
      proyecto_id: proyectoId, categoria_id: categoriaId, limite, es_fijo: false, mes_ano: mesAno,
    })
    return error ? { error: error.message } : {}
  }
}

export async function eliminarPresupuesto(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('presupuestos').update({ activo: false }).eq('id', id)
  return error ? { error: error.message } : {}
}
