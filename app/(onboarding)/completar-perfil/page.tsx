import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CompletarPerfilForm from '@/components/perfil/CompletarPerfilForm'

export default async function CompletarPerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('nombre')
    .eq('id', user.id)
    .single()

  if (perfil?.nombre) redirect('/mis-proyectos')

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Bienvenido a Bolsillo</h1>
        <p className="text-neutral-500 text-sm mt-2">¿Cómo quieres que te llamemos?</p>
      </div>
      <CompletarPerfilForm userId={user.id} />
    </div>
  )
}
