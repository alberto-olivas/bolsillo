'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { unirseProyecto } from '@/app/actions/proyectos'
import { Hash } from 'lucide-react'

export default function UnirseConCodigoForm() {
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [abierto, setAbierto] = useState(false)
  const router = useRouter()

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
      setCargando(false)
      router.refresh()
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
        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#222222]/30 hover:border-[#222222] text-[#222222]/50 hover:text-[#222222] rounded-2xl py-4 transition-colors text-sm font-black"
      >
        <Hash className="w-4 h-4" />
        Unirme con código
      </button>
    )
  }

  return (
    <div className="bg-[#FFF8EC] rounded-2xl p-5 border-2 border-[#222222] space-y-4" style={{ boxShadow: '4px 4px 0px 0px #222222' }}>
      <p className="text-[#222222] font-black text-base">Unirme a un proyecto</p>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wide text-[#222222]/50">Código de invitación</label>
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
            className="w-full bg-[#FFE9CE] text-[#222222] placeholder-[#222222]/40 rounded-xl pl-9 pr-4 py-3 text-base font-mono tracking-widest border-2 border-[#222222] focus:outline-none focus:ring-2 focus:ring-[#FFD80B] uppercase"
          />
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setAbierto(false); setError(''); setCodigo('') }}
          className="flex-1 bg-[#FFE9CE] hover:bg-[#FBDDB2] text-[#222222]/60 font-black py-3 rounded-xl transition-colors text-sm border-2 border-[#222222]"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={cargando || codigo.length < 6}
          onClick={handleUnirse}
          className="flex-1 bg-[#222222] hover:bg-[#000000] disabled:opacity-40 disabled:cursor-not-allowed text-[#FFD80B] font-black py-3 rounded-xl transition-colors text-sm border-2 border-[#222222]"
        >
          {cargando ? 'Buscando...' : 'Unirme'}
        </button>
      </div>
    </div>
  )
}
