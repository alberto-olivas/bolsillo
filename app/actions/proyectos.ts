'use server'

import { createClient } from '@/lib/supabase/server'

export async function crearProyecto(nombre: string, tipo: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { error } = await supabase
    .from('proyectos')
    .insert({ nombre, tipo, creado_por: user.id })

  if (error) throw new Error(error.message)
}

export async function unirseProyecto(codigo: string) {
  const supabase = await createClient()
  const { data: proyectoId, error } = await supabase
    .rpc('unirse_proyecto', { p_codigo: codigo })

  if (error) throw new Error(error.message)
  if (!proyectoId) throw new Error('Código no encontrado')

  return proyectoId as string
}
