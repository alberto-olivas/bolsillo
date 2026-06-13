'use client'

import { useState } from 'react'
import { ICONOS } from '@/lib/iconos-categorias'
import { Package } from 'lucide-react'
import { guardarPresupuesto, eliminarPresupuesto } from '@/app/actions/presupuestos'

type Categoria = {
  id: string
  nombre: string
  icono: string
  color: string
}

type PresupuestoExistente = {
  id: string
  limite: number
  esFijo: boolean
  mesAno: string | null
}

type Props = {
  categoria: Categoria
  presupuesto: PresupuestoExistente | null
  proyectoId: string
  mesAno: string
  onClose: () => void
}

function fmtMes(mesAno: string) {
  const [year, month] = mesAno.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
}

export default function PresupuestoModal({ categoria, presupuesto, proyectoId, mesAno, onClose }: Props) {
  const [limiteStr, setLimiteStr] = useState(presupuesto ? String(presupuesto.limite) : '')
  const [esFijo, setEsFijo] = useState(presupuesto ? presupuesto.esFijo : true)
  const [loading, setLoading] = useState(false)
  const [loadingEliminar, setLoadingEliminar] = useState(false)
  const [error, setError] = useState('')

  const Icono = ICONOS[categoria.icono] ?? Package
  const limite = parseFloat(limiteStr.replace(',', '.'))

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault()
    if (!limiteStr || isNaN(limite) || limite <= 0) return
    setLoading(true)
    setError('')

    // Si cambió el tipo, eliminar el presupuesto anterior antes de crear el nuevo
    if (presupuesto && presupuesto.esFijo !== esFijo) {
      await eliminarPresupuesto(presupuesto.id)
    }

    const result = await guardarPresupuesto(proyectoId, categoria.id, limite, esFijo, mesAno)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      window.location.reload()
    }
  }

  async function handleEliminar() {
    if (!presupuesto) return
    setLoadingEliminar(true)
    const result = await eliminarPresupuesto(presupuesto.id)
    if (result.error) {
      setError(result.error)
      setLoadingEliminar(false)
    } else {
      window.location.reload()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-t-3xl p-6 pb-24 space-y-5 max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full mx-auto" />

        {/* Cabecera: icono + nombre de categoría */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: categoria.color + '33' }}
          >
            <Icono className="w-5 h-5" style={{ color: categoria.color }} />
          </div>
          <div>
            <p className="text-base font-semibold text-neutral-900 dark:text-white">{categoria.nombre}</p>
            <p className="text-xs text-neutral-500">
              {presupuesto ? 'Editar presupuesto' : 'Nuevo presupuesto'}
            </p>
          </div>
        </div>

        <form onSubmit={handleGuardar} className="space-y-4">
          {/* Límite */}
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              Límite mensual (€)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={limiteStr}
              onChange={e => setLimiteStr(e.target.value)}
              placeholder="0,00"
              className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>

          {/* Toggle Fijo / Puntual */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-900 dark:text-white font-medium">Repetir cada mes</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {esFijo ? 'Se aplica a todos los meses' : `Solo para ${fmtMes(mesAno)}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEsFijo(v => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${esFijo ? 'bg-indigo-600' : 'bg-neutral-300 dark:bg-neutral-600'}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${esFijo ? 'translate-x-5' : 'translate-x-0.5'}`}
              />
            </button>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          {/* Guardar */}
          <button
            type="submit"
            disabled={loading || !limiteStr || isNaN(limite) || limite <= 0}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl text-sm transition-colors"
          >
            {loading ? 'Guardando...' : 'Guardar presupuesto'}
          </button>
        </form>

        {/* Eliminar (solo si existe presupuesto) */}
        {presupuesto && (
          <button
            onClick={handleEliminar}
            disabled={loadingEliminar}
            className="w-full text-red-400 hover:text-red-500 disabled:opacity-50 text-sm font-medium py-2 transition-colors"
          >
            {loadingEliminar ? 'Eliminando...' : 'Eliminar presupuesto'}
          </button>
        )}
      </div>
    </div>
  )
}
