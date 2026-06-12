'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus } from 'lucide-react'

export default function CrearProyectoForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState<'personal' | 'compartido'>('personal')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [abierto, setAbierto] = useState(false)

  // En React 19, onSubmit en formularios renderizados condicionalmente puede
  // no dispararse. Usamos onClick en el botón directamente para evitar el problema.
  async function crearProyecto() {
    const nombreLimpio = nombre.trim()
    if (!nombreLimpio) {
      setError('El nombre del proyecto es obligatorio')
      return
    }
    setCargando(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase
      .from('proyectos')
      .insert({ nombre: nombreLimpio, tipo, creado_por: userId })
    if (err) {
      setError('Error al crear el proyecto. Inténtalo de nuevo.')
      setCargando(false)
      return
    }
    setNombre('')
    setTipo('personal')
    setCargando(false)
    setAbierto(false)
    router.refresh()
  }

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="w-full flex items-center justify-center gap-2 border border-dashed border-neutral-700 hover:border-indigo-500 text-neutral-500 hover:text-indigo-400 rounded-2xl py-4 transition-colors text-sm"
      >
        <Plus className="w-4 h-4" />
        Nuevo proyecto
      </button>
    )
  }

  return (
    <div className="bg-neutral-900 rounded-2xl p-5 border border-indigo-800 space-y-4">
      <p className="text-white font-medium text-sm">Nuevo proyecto</p>

      <div className="space-y-2">
        <label className="text-xs text-neutral-400">Nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          // Enter en el input también lanza la función directamente
          onKeyDown={e => { if (e.key === 'Enter' && !cargando) crearProyecto() }}
          placeholder="Ej: Gastos del piso"
          maxLength={60}
          autoFocus
          className="w-full bg-neutral-800 text-white placeholder-neutral-600 rounded-xl px-4 py-3 text-sm border border-neutral-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Selector de tipo */}
      <div className="grid grid-cols-2 gap-2">
        {(['personal', 'compartido'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTipo(t)}
            className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
              tipo === t
                ? 'bg-indigo-600 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
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
          className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 font-medium py-3 rounded-xl transition-colors text-sm"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={cargando}
          onClick={crearProyecto}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:text-indigo-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          {cargando ? 'Creando...' : 'Crear'}
        </button>
      </div>
    </div>
  )
}
