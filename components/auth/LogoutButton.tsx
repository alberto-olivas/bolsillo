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
      className="w-full bg-[#FFE9CE] hover:bg-[#FBDDB2] text-[#222222]/60 hover:text-[#222222] px-4 py-3 rounded-xl text-sm font-black transition-colors border-2 border-[#222222]"
    >
      Cerrar sesión
    </button>
  )
}
