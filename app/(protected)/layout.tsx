import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Layout para rutas protegidas.
// proxy.ts ya verificó que el usuario está autenticado.
// Aquí verificamos que además tiene el perfil completo (nombre rellenado).
// Si nombre es NULL → todavía no completó su perfil → /completar-perfil.
// /completar-perfil está en el grupo (onboarding), no en (protected),
// así que este layout NO se vuelve a ejecutar para esa ruta y no hay bucle infinito.
export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('nombre')
    .eq('id', user.id)
    .single()

  if (!perfil?.nombre) redirect('/completar-perfil')

  return <>{children}</>
}
