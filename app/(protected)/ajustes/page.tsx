export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import LogoutButton from '@/components/auth/LogoutButton'
import EditarNombreForm from '@/components/ajustes/EditarNombreForm'
import InstalarAppButton from '@/components/ajustes/InstalarAppButton'

export default async function AjustesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('nombre, email')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="max-w-sm mx-auto px-4 py-6 space-y-6">

        {/* Cabecera */}
        <div className="flex items-center gap-3">
          <Link
            href="/mis-proyectos"
            className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold text-neutral-900 dark:text-white">Ajustes</h1>
        </div>

        {/* Cuenta */}
        <div className="space-y-2">
          <h2 className="text-neutral-500 dark:text-neutral-400 text-xs font-medium uppercase tracking-wider">
            Cuenta
          </h2>
          <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl px-4 py-3 border border-neutral-200 dark:border-neutral-800">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Email</p>
            <p className="text-sm text-neutral-900 dark:text-white mt-0.5">{perfil?.email ?? user.email}</p>
          </div>
        </div>

        {/* Perfil */}
        <div className="space-y-2">
          <h2 className="text-neutral-500 dark:text-neutral-400 text-xs font-medium uppercase tracking-wider">
            Perfil
          </h2>
          <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">Nombre</p>
            <EditarNombreForm nombreActual={perfil?.nombre ?? ''} />
          </div>
        </div>

        {/* Apariencia */}
        <div className="space-y-2">
          <h2 className="text-neutral-500 dark:text-neutral-400 text-xs font-medium uppercase tracking-wider">
            Apariencia
          </h2>
          <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl px-4 py-3 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <p className="text-sm text-neutral-900 dark:text-white">Tema claro / oscuro</p>
            <ThemeToggle />
          </div>
        </div>

        {/* Aplicación */}
        <InstalarAppButton />

        {/* Sesión */}
        <div className="space-y-2">
          <h2 className="text-neutral-500 dark:text-neutral-400 text-xs font-medium uppercase tracking-wider">
            Sesión
          </h2>
          <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800">
            <LogoutButton />
          </div>
        </div>

      </div>
    </div>
  )
}
