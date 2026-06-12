export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/auth/LogoutButton'
import ProyectoCard from '@/components/proyectos/ProyectoCard'
import CrearProyectoForm from '@/components/proyectos/CrearProyectoForm'
import UnirseConCodigoForm from '@/components/proyectos/UnirseConCodigoForm'

export default async function MisProyectosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Datos del perfil para mostrar el nombre en la cabecera
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('nombre, email')
    .eq('id', user.id)
    .single()

  // Proyectos del usuario + miembros de cada uno.
  // La RLS garantiza que solo ve los proyectos donde es miembro.
  const { data: proyectos } = await supabase
    .from('proyectos')
    .select(`
      id,
      nombre,
      tipo,
      codigo_invitacion,
      miembros_proyecto (
        user_id,
        perfiles (
          nombre,
          email
        )
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-sm mx-auto px-4 py-6 space-y-6">

        {/* Cabecera */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Bolsillo</h1>
            <p className="text-neutral-500 text-xs mt-0.5">Hola, {perfil?.nombre ?? 'tú'}</p>
          </div>
          <LogoutButton />
        </div>

        {/* Lista de proyectos */}
        <div className="space-y-3">
          <h2 className="text-neutral-400 text-xs font-medium uppercase tracking-wider">Mis proyectos</h2>

          {proyectos && proyectos.length > 0 ? (
            proyectos.map(p => (
              <ProyectoCard
                key={p.id}
                id={p.id}
                nombre={p.nombre}
                tipo={p.tipo as 'personal' | 'compartido'}
                codigo_invitacion={p.codigo_invitacion}
                miembros={p.miembros_proyecto as any}
              />
            ))
          ) : (
            <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800 text-center">
              <p className="text-neutral-500 text-sm">No tienes proyectos todavía.</p>
              <p className="text-neutral-600 text-xs mt-1">Crea uno o únete con un código.</p>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="space-y-3">
          <CrearProyectoForm userId={user.id} />
          <UnirseConCodigoForm />
        </div>

      </div>
    </div>
  )
}
