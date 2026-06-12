import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/auth/LogoutButton'

// Server Component: verifica la sesión directamente en el servidor
export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Doble verificación por si el proxy.ts no alcanzó a interceptar
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">

        {/* Cabecera */}
        <div className="text-center mb-2">
          <h1 className="text-3xl font-bold text-white">Bolsillo</h1>
        </div>

        {/* Card de bienvenida */}
        <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800 shadow-xl">
          <p className="text-neutral-400 text-sm mb-1">Bienvenido de nuevo</p>
          <p className="text-white font-medium truncate">{user.email}</p>
        </div>

        {/* Estado de la app */}
        <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-green-400 text-sm">✓</span>
            </div>
            <div>
              <p className="text-white font-medium text-sm">Fase 1 completada</p>
              <p className="text-neutral-500 text-xs">Auth con Supabase funcionando</p>
            </div>
          </div>
          <div className="flex items-center gap-3 opacity-40">
            <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center">
              <span className="text-neutral-400 text-sm">2</span>
            </div>
            <div>
              <p className="text-neutral-400 text-sm">Fase 2 — Base de datos</p>
              <p className="text-neutral-500 text-xs">Tablas y políticas RLS</p>
            </div>
          </div>
        </div>

        {/* Cerrar sesión */}
        <LogoutButton />

      </div>
    </div>
  )
}
