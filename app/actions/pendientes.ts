'use server'

import { createClient } from '@/lib/supabase/server'

export async function confirmarPendiente(pendienteId: string, gastoFijoId: string, proyectoId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: gf } = await supabase
    .from('gastos_fijos')
    .select('nombre, cantidad, tipo, dia_del_mes, categoria_id')
    .eq('id', gastoFijoId)
    .single()
  if (!gf) throw new Error('Gasto fijo no encontrado')

  const { data: pendiente } = await supabase
    .from('pendientes_confirmar')
    .select('mes_ano')
    .eq('id', pendienteId)
    .single()
  if (!pendiente) throw new Error('Pendiente no encontrado')

  const [year, month] = pendiente.mes_ano.split('-').map(Number)
  const diasEnMes = new Date(year, month, 0).getDate()
  const dia = Math.min(gf.dia_del_mes, diasEnMes)
  const fecha = `${year}-${String(month).padStart(2, '0')}-${String(dia).padStart(2, '0')}`

  const { error: errorMov } = await supabase
    .from('movimientos')
    .insert({
      proyecto_id: proyectoId,
      usuario_id: user.id,
      tipo: gf.tipo,
      cantidad: gf.cantidad,
      categoria_id: gf.categoria_id,
      fecha,
      descripcion: gf.nombre,
      es_fijo: true,
      gasto_fijo_id: gastoFijoId,
    })
  if (errorMov) throw new Error(errorMov.message)

  const { error: errorPend } = await supabase
    .from('pendientes_confirmar')
    .update({ estado: 'confirmado' })
    .eq('id', pendienteId)
  if (errorPend) throw new Error(errorPend.message)
}

export async function descartarPendiente(pendienteId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { error } = await supabase
    .from('pendientes_confirmar')
    .update({ estado: 'descartado' })
    .eq('id', pendienteId)
  if (error) throw new Error(error.message)
}
