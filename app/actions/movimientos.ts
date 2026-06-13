'use server'

import { createClient } from '@/lib/supabase/server'

export async function crearMovimiento(
  proyectoId: string,
  tipo: 'gasto' | 'ingreso',
  cantidad: number,
  categoriaId: string,
  fecha: string,
  descripcion?: string,
  esFijo?: boolean,
  diaDelMes?: number
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  let gastoFijoId: string | null = null

  if (esFijo && diaDelMes) {
    const { data: cat } = await supabase
      .from('categorias')
      .select('nombre')
      .eq('id', categoriaId)
      .single()

    const { data: gastoFijo, error: errorFijo } = await supabase
      .from('gastos_fijos')
      .insert({
        proyecto_id: proyectoId,
        categoria_id: categoriaId,
        nombre: descripcion || cat?.nombre || 'Gasto fijo',
        cantidad,
        tipo,
        dia_del_mes: diaDelMes,
        activo: true,
      })
      .select('id')
      .single()

    if (errorFijo) throw new Error(errorFijo.message)
    gastoFijoId = gastoFijo.id
  }

  const { error } = await supabase
    .from('movimientos')
    .insert({
      proyecto_id: proyectoId,
      usuario_id: user.id,
      tipo,
      cantidad,
      categoria_id: categoriaId,
      fecha,
      descripcion: descripcion || null,
      es_fijo: esFijo ?? false,
      gasto_fijo_id: gastoFijoId,
    })
  if (error) throw new Error(error.message)
}

export async function editarMovimiento(
  id: string,
  cantidad: number,
  categoriaId: string,
  fecha: string,
  descripcion?: string,
  esFijo?: boolean,
  diaDelMes?: number,
  currentGastoFijoId?: string | null
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  let nuevoGastoFijoId: string | null = currentGastoFijoId ?? null

  // Antes no era fijo, ahora sí → crear gastos_fijo
  if (esFijo && !currentGastoFijoId) {
    const { data: cat } = await supabase
      .from('categorias')
      .select('nombre, proyecto_id, tipo')
      .eq('id', categoriaId)
      .single()

    const { data: gastoFijo, error: errorFijo } = await supabase
      .from('gastos_fijos')
      .insert({
        proyecto_id: cat?.proyecto_id,
        categoria_id: categoriaId,
        nombre: descripcion || cat?.nombre || 'Gasto fijo',
        cantidad,
        tipo: cat?.tipo,
        dia_del_mes: diaDelMes ?? 1,
        activo: true,
      })
      .select('id')
      .single()

    if (errorFijo) throw new Error(errorFijo.message)
    nuevoGastoFijoId = gastoFijo.id
  }

  // Antes era fijo, ahora no → desactivar gastos_fijo
  if (!esFijo && currentGastoFijoId) {
    await supabase
      .from('gastos_fijos')
      .update({ activo: false })
      .eq('id', currentGastoFijoId)
    nuevoGastoFijoId = null
  }

  // Sigue siendo fijo → actualizar gastos_fijo
  if (esFijo && currentGastoFijoId) {
    await supabase
      .from('gastos_fijos')
      .update({ cantidad, categoria_id: categoriaId, dia_del_mes: diaDelMes ?? 1 })
      .eq('id', currentGastoFijoId)
  }

  const { error } = await supabase
    .from('movimientos')
    .update({
      cantidad,
      categoria_id: categoriaId,
      fecha,
      descripcion: descripcion || null,
      es_fijo: esFijo ?? false,
      gasto_fijo_id: nuevoGastoFijoId,
    })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function eliminarMovimiento(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { error } = await supabase
    .from('movimientos')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
}
