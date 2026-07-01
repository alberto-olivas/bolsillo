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
        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#222222]/30 dark:border-[#F5E6D0]/30 hover:border-[#222222] dark:hover:border-[#F5E6D0] text-[#222222]/50 dark:text-[#F5E6D0]/50 hover:text-[#222222] dark:hover:text-[#F5E6D0] rounded-2xl py-4 transition-colors text-sm font-black"
      >
        <Hash className="w-4 h-4" />
        Unirme con código
      </button>
    )
  }

  return (
    <div className="bg-[#FFF8EC] dark:bg-[#2A2420] rounded-2xl p-5 border-2 border-[#222222] dark:border-[#F5E6D0] space-y-4" style={{ boxShadow: '4px 4px 0px 0px var(--shadow-main)' }}>
      <p className="text-[#222222] dark:text-[#F5E6D0] font-black text-base">Unirme a un proyecto</p>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wide text-[#222222]/50 dark:text-[#F5E6D0]/50">Código de invitación</label>
        <div className="relative">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-[#222222]/50 dark:text-[#F5E6D0]/50 w-4 h-4" />
          <input
            type="text"
            value={codigo}
            onChange={e => setCodigo(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
            onKeyDown={e => { if (e.key === 'Enter' && !cargando) handleUnirse() }}
            placeholder="AB3X9K"
            maxLength={6}
            autoFocus
            className="w-full bg-[#FFE9CE] dark:bg-[#332E28] text-[#222222] dark:text-[#F5E6D0] placeholder-[#222222]/40 dark:placeholder-[#F5E6D0]/40 rounded-xl pl-9 pr-4 py-3 text-base font-mono tracking-widest border-2 border-[#222222] dark:border-[#F5E6D0] focus:outline-none focus:ring-2 focus:ring-[#FFD80B] uppercase"
          />
        </div>
        {error && (
          <p className="text-[#FD4C38] text-xs font-black bg-[#FFE2DD] dark:bg-[#3A1A16] px-3 py-2 rounded-xl border-2 border-[#FD4C38]">
            {error}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setAbierto(false); setError(''); setCodigo('') }}
          className="flex-1 bg-[#FFE9CE] dark:bg-[#332E28] hover:bg-[#FBDDB2] dark:hover:bg-[#3A3228] text-[#222222]/60 dark:text-[#F5E6D0]/60 font-black py-3 rounded-xl transition-colors text-sm border-2 border-[#222222] dark:border-[#F5E6D0]"
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
