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
        className="w-full flex items-center justify-center gap-2 border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-[#D85A30] text-neutral-500 hover:text-[#D85A30] rounded-2xl py-4 transition-colors text-sm"
      >
        <Plus className="w-4 h-4" />
        Nuevo proyecto
      </button>
    )
  }

  return (
    <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl p-5 border border-[#D85A30]/40 space-y-4">
      <p className="text-neutral-900 dark:text-white font-medium text-sm">Nuevo proyecto</p>

      <div className="space-y-2">
        <label className="text-xs text-neutral-600 dark:text-neutral-400">Nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !cargando) handleCrear() }}
          placeholder="Ej: Gastos del piso"
          maxLength={60}
          autoFocus
          className="w-full bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 rounded-xl px-4 py-3 text-base border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
                ? 'bg-[#D85A30] text-white'
                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-300 dark:hover:bg-neutral-700'
            }`}
          >
            {t === 'personal' ? 'Personal' : 'Compartido'}
          </button>
        ))}
      </div>

      {tipo === 'compartido' && (
        <p className="text-xs text-neutral-500">Se generará un código de invitación automáticamente.</p>
      )}

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setAbierto(false); setError('') }}
          className="flex-1 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 font-medium py-3 rounded-xl transition-colors text-sm"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={cargando}
          onClick={handleCrear}
          className="flex-1 bg-[#D85A30] hover:bg-[#c14f28] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          {cargando ? 'Creando...' : 'Crear'}
        </button>
      </div>
    </div>
  )
}
