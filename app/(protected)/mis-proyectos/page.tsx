export const dynamic = 'force-dynamic'

import { createClient, getCachedUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import ProyectoCard from '@/components/proyectos/ProyectoCard'
import CrearProyectoForm from '@/components/proyectos/CrearProyectoForm'
import UnirseConCodigoForm from '@/components/proyectos/UnirseConCodigoForm'

export default async function MisProyectosPage() {
  const supabase = await createClient()
  const user = await getCachedUser()
  if (!user) redirect('/login')

  const [{ data: perfil }, { data: proyectos }] = await Promise.all([
    supabase.from('perfiles').select('nombre, email').eq('id', user.id).single(),
    supabase.from('proyectos').select(`
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
    `).order('created_at', { ascending: false }),
  ])

  if (!perfil?.nombre) redirect('/completar-perfil')

  return (
    <div className="min-h-screen bg-[#FFF8EC] dark:bg-[#1A1612]">
      <div className="bg-[#222222] px-4 pt-6 pb-5">
        <div className="max-w-sm mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[#FFD80B]">Bolsillo 💼</h1>
            <p className="text-[#FFE9CE]/60 text-xs mt-0.5 font-bold">Hola, {perfil?.nombre ?? 'tú'}</p>
          </div>
          <Link href="/ajustes" className="text-[#FFE9CE]/60 hover:text-[#FFE9CE] transition-colors p-2">
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </div>
      <div className="max-w-sm mx-auto px-4 py-6 space-y-6">

        {/* Lista de proyectos */}
        <div className="space-y-3">
          <h2 className="text-[#222222]/50 dark:text-[#F5E6D0]/50 text-[10px] font-black uppercase tracking-widest">Mis proyectos</h2>

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
            <div className="bg-[#FFF8EC] dark:bg-[#2A2420] rounded-2xl p-6 border-2 border-[#222222] dark:border-[#F5E6D0] text-center" style={{ boxShadow: '4px 4px 0px 0px var(--shadow-main)' }}>
              <p className="text-[#222222]/60 dark:text-[#F5E6D0]/60 text-sm font-bold">No tienes proyectos todavía.</p>
              <p className="text-[#222222]/40 dark:text-[#F5E6D0]/40 text-xs mt-1 font-medium">Crea uno o únete con un código.</p>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="space-y-3">
          <CrearProyectoForm />
          <UnirseConCodigoForm />
        </div>

      </div>
    </div>
  )
}
