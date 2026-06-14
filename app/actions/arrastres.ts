'use server'

import { createClient } from '@/lib/supabase/server'

export async function confirmarArrastre(arrastreId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { error } = await supabase
    .from('arrastres_mes')
    .update({ estado: 'confirmado' })
    .eq('id', arrastreId)
  if (error) throw new Error(error.message)
}

export async function descartarArrastre(arrastreId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { error } = await supabase
    .from('arrastres_mes')
    .update({ estado: 'descartado' })
    .eq('id', arrastreId)
  if (error) throw new Error(error.message)
}
