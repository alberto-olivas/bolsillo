'use client'

import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export default function LupaBoton({ proyectoId }: { proyectoId: string }) {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={() => router.push(`/proyectos/${proyectoId}?q=`)}
      className="ml-auto flex-shrink-0 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors p-1 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
    >
      <Search className="w-5 h-5" />
    </button>
  )
}
