export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { createClient, getCachedUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ThemeToggle from '@/components/ui/ThemeToggle'
import LogoutButton from '@/components/auth/LogoutButton'
import EditarNombreForm from '@/components/ajustes/EditarNombreForm'
import InstalarAppButton from '@/components/ajustes/InstalarAppButton'
import BottomNav from '@/components/nav/BottomNav'

export default async function AjustesPage({
  searchParams,
}: {
  searchParams: Promise<{ proyecto?: string }>
}) {
  const { proyecto: proyectoId } = await searchParams

  const supabase = await createClient()
  const user = await getCachedUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('nombre, email')
    .eq('id', user.id)
    .single()

  return (
    <>
      <div className="min-h-screen bg-[#FFF8EC]">
        <div className="bg-[#222222] px-4 pt-6 pb-5">
          <div className="max-w-sm mx-auto">
            <h1 className="text-lg font-black text-[#FFE9CE]">Ajustes</h1>
          </div>
        </div>
        <div className="max-w-sm mx-auto px-4 py-6 pb-24 space-y-6">

          {/* Cuenta */}
          <div className="space-y-2">
            <h2 className="text-[#222222]/50 text-[10px] font-black uppercase tracking-widest">
              Cuenta
            </h2>
            <div className="bg-[#FFF8EC] rounded-2xl px-4 py-3 border-2 border-[#222222]" style={{ boxShadow: '4px 4px 0px 0px #222222' }}>
              <p className="text-[10px] font-black uppercase tracking-wide text-[#222222]/50">Email</p>
              <p className="text-sm text-[#222222] mt-0.5 font-medium">{perfil?.email ?? user.email}</p>
            </div>
          </div>

          {/* Perfil */}
          <div className="space-y-2">
            <h2 className="text-[#222222]/50 text-[10px] font-black uppercase tracking-widest">
              Perfil
            </h2>
            <div className="bg-[#FFF8EC] rounded-2xl p-4 border-2 border-[#222222]" style={{ boxShadow: '4px 4px 0px 0px #222222' }}>
              <p className="text-[10px] font-black uppercase tracking-wide text-[#222222]/50 mb-3">Nombre</p>
              <EditarNombreForm nombreActual={perfil?.nombre ?? ''} />
            </div>
          </div>

          {/* Apariencia */}
          <div className="space-y-2">
            <h2 className="text-[#222222]/50 text-[10px] font-black uppercase tracking-widest">
              Apariencia
            </h2>
            <div className="bg-[#FFF8EC] rounded-2xl px-4 py-3 border-2 border-[#222222] flex items-center justify-between" style={{ boxShadow: '4px 4px 0px 0px #222222' }}>
              <p className="text-sm text-[#222222] font-black">Tema claro / oscuro</p>
              <ThemeToggle />
            </div>
          </div>

          {/* Aplicación */}
          <InstalarAppButton />

          {/* Sesión */}
          <div className="space-y-2">
            <h2 className="text-[#222222]/50 text-[10px] font-black uppercase tracking-widest">
              Sesión
            </h2>
            <div className="bg-[#FFF8EC] rounded-2xl p-4 border-2 border-[#222222]" style={{ boxShadow: '4px 4px 0px 0px #222222' }}>
              <LogoutButton />
            </div>
          </div>

        </div>
      </div>

      {proyectoId && (
        <Suspense fallback={null}>
          <BottomNav proyectoId={proyectoId} />
        </Suspense>
      )}
    </>
  )
}
