'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearProyecto } from '@/app/actions/proyectos'
import { Plus } from 'lucide-react'

export default function CrearProyectoForm() {
  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState<'personal' | 'compartido'>('personal')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [abierto, setAbierto] = useState(false)
  const router = useRouter()

  async function handleCrear() {
    const nombreLimpio = nombre.trim()
    if (!nombreLimpio) {
      setError('El nombre del proyecto es obligatorio')
      return
    }
    setCargando(true)
    setError('')
    try {
      await crearProyecto(nombreLimpio, tipo)
      setCargando(false)
      router.refresh()
    } catch (error) {
      setError('Error al crear el proyecto. Inténtalo de nuevo.')
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
        <Plus className="w-4 h-4" />
        Nuevo proyecto
      </button>
    )
  }

  return (
    <div className="bg-[#FFF8EC] rounded-2xl p-5 border-2 border-[#222222] space-y-4" style={{ boxShadow: '4px 4px 0px 0px #222222' }}>
      <p className="text-[#222222] font-black text-base">Nuevo proyecto</p>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wide text-[#222222]/50">Nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !cargando) handleCrear() }}
          placeholder="Ej: Gastos del piso"
          maxLength={60}
          autoFocus
          className="w-full bg-[#FFE9CE] text-[#222222] placeholder-[#222222]/40 rounded-xl px-4 py-3 text-base border-2 border-[#222222] focus:outline-none focus:ring-2 focus:ring-[#FFD80B]"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {(['personal', 'compartido'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTipo(t)}
            className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
              tipo === t
                ? 'bg-[#222222] text-[#FFD80B]'
                : 'bg-[#FFE9CE] text-[#222222]/50 hover:bg-[#FBDDB2] border-2 border-[#222222]'
            }`}
          >
            {t === 'personal' ? 'Personal' : 'Compartido'}
          </button>
        ))}
      </div>

      {tipo === 'compartido' && (
        <p className="text-xs text-[#222222]/50 font-medium">Se generará un código de invitación automáticamente.</p>
      )}

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setAbierto(false); setError('') }}
          className="flex-1 bg-[#FFE9CE] hover:bg-[#FBDDB2] text-[#222222]/60 font-black py-3 rounded-xl transition-colors text-sm border-2 border-[#222222]"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={cargando}
          onClick={handleCrear}
          className="flex-1 bg-[#222222] hover:bg-[#000000] disabled:opacity-40 disabled:cursor-not-allowed text-[#FFD80B] font-black py-3 rounded-xl transition-colors text-sm border-2 border-[#222222]"
        >
          {cargando ? 'Creando...' : 'Crear'}
        </button>
      </div>
    </div>
  )
}
