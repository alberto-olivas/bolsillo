'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Server Action: crea un proyecto en el servidor, con acceso directo a la
// sesión del usuario y llamada a revalidatePath para limpiar el caché
// de Next.js. Así router.refresh() en el cliente obtiene datos reales.
export async function crearProyecto(nombre: string, tipo: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { error } = await supabase
    .from('proyectos')
    .insert({ nombre, tipo, creado_por: user.id })

  if (error) throw new Error(error.message)

  revalidatePath('/mis-proyectos')
}

export async function unirseProyecto(codigo: string) {
  const supabase = await createClient()
  const { data: proyectoId, error } = await supabase
    .rpc('unirse_proyecto', { p_codigo: codigo })

  if (error) throw new Error(error.message)
  if (!proyectoId) throw new Error('Código no encontrado')

  revalidatePath('/mis-proyectos')
  return proyectoId as string
}
