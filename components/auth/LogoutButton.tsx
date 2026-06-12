'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors"
    >
      Cerrar sesión
    </button>
  )
}
