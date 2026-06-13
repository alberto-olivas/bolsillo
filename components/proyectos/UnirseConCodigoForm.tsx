'use client'

import { useState } from 'react'
import { unirseProyecto } from '@/app/actions/proyectos'
import { Hash } from 'lucide-react'

export default function UnirseConCodigoForm() {
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [abierto, setAbierto] = useState(false)

  async function handleUnirse() {
    const codigoLimpio = codigo.trim().toUpperCase()
    if (codigoLimpio.length !== 6) {
      setError('El código tiene exactamente 6 caracteres')
      return
    }
    setCargando(true)
    setError('')
    try {
      await unirseProyecto(codigoLimpio)
      window.location.reload()
    } catch (err: any) {
      const msg = err?.message === 'Código no encontrado'
        ? 'Código no encontrado. Comprueba que está bien escrito.'
        : 'Error al unirse. Inténtalo de nuevo.'
      setError(msg)
      setCargando(false)
    }
  }

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="w-full flex items-center justify-center gap-2 border border-dashed border-neutral-700 hover:border-indigo-500 text-neutral-500 hover:text-indigo-400 rounded-2xl py-4 transition-colors text-sm"
      >
        <Hash className="w-4 h-4" />
        Unirme con código
      </button>
    )
  }

  return (
    <div className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800 space-y-4">
      <p className="text-white font-medium text-sm">Unirme a un proyecto</p>

      <div className="space-y-2">
        <label className="text-xs text-neutral-400">Código de invitación</label>
        <div className="relative">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
          <input
            type="text"
            value={codigo}
            onChange={e => setCodigo(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
            onKeyDown={e => { if (e.key === 'Enter' && !cargando) handleUnirse() }}
            placeholder="AB3X9K"
            maxLength={6}
            autoFocus
            className="w-full bg-neutral-800 text-white placeholder-neutral-600 rounded-xl pl-9 pr-4 py-3 text-sm font-mono tracking-widest border border-neutral-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 uppercase"
          />
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setAbierto(false); setError(''); setCodigo('') }}
          className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 font-medium py-3 rounded-xl transition-colors text-sm"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={cargando || codigo.length < 6}
          onClick={handleUnirse}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:text-indigo-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          {cargando ? 'Buscando...' : 'Unirme'}
        </button>
      </div>
    </div>
  )
}
