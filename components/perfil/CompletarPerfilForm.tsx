'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from 'lucide-react'

export default function CompletarPerfilForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const nombreLimpio = nombre.trim()
    if (!nombreLimpio) {
      setError('Escribe tu nombre para continuar')
      return
    }
    setCargando(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase
      .from('perfiles')
      .update({ nombre: nombreLimpio })
      .eq('id', userId)
    if (err) {
      setError('Error al guardar. Inténtalo de nuevo.')
      setCargando(false)
      return
    }
    router.push('/mis-proyectos')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-4">
      <div className="space-y-2">
        <label className="text-sm text-neutral-600 dark:text-neutral-400 block">Tu nombre</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Alberto"
            maxLength={50}
            autoFocus
            className="w-full bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 rounded-xl pl-9 pr-4 py-3 text-base border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>
      <button
        type="submit"
        disabled={cargando}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:text-indigo-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
      >
        {cargando ? 'Guardando...' : 'Continuar'}
      </button>
    </form>
  )
}
