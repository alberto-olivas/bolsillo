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
      setLoading(false)
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
        className="w-full bg-[#FFE9CE] border-2 border-[#222222] text-[#222222] placeholder-[#222222]/40 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#FFD80B]"
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button
        type="submit"
        disabled={loading || !nombre.trim()}
        className="w-full bg-[#222222] hover:bg-[#000000] disabled:opacity-50 disabled:cursor-not-allowed text-[#FFD80B] font-black py-3 rounded-xl text-sm transition-colors border-2 border-[#222222]"
        style={{ boxShadow: '3px 3px 0px 0px rgba(34,34,34,0.2)' }}
      >
        {loading ? 'Guardando...' : 'Guardar nombre'}
      </button>
    </form>
  )
}
