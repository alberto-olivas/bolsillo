'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { editarNombre } from '@/app/actions/perfil'

export default function EditarNombreForm({ nombreActual }: { nombreActual: string }) {
  const router = useRouter()
  const [nombre, setNombre] = useState(nombreActual)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim()) return
    setLoading(true)
    setError('')
    const result = await editarNombre(nombre)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={nombre}
        onChange={e => setNombre(e.target.value)}
        placeholder="Tu nombre"
        maxLength={50}
        className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button
        type="submit"
        disabled={loading || !nombre.trim()}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl text-sm transition-colors"
      >
        {loading ? 'Guardando...' : 'Guardar nombre'}
      </button>
    </form>
  )
}
