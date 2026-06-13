'use server'

import { createClient } from '@/lib/supabase/server'

export async function editarNombre(nombre: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }
  const { error } = await supabase
    .from('perfiles')
    .update({ nombre: nombre.trim() })
    .eq('id', user.id)
  return error ? { error: error.message } : {}
}
