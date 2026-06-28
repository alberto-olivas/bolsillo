'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()

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
      setLoading(false)
      router.refresh()
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
      setLoadingEliminar(false)
      router.refresh()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[#FFF8EC] rounded-t-3xl p-6 pb-24 space-y-5 max-h-[85vh] overflow-y-auto border-t-2 border-x-2 border-[#222222]"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-[#222222]/20 rounded-full mx-auto" />

        {/* Cabecera: icono + nombre de categoría */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-[#222222]/20"
            style={{ backgroundColor: categoria.color + '33' }}
          >
            <Icono className="w-5 h-5" style={{ color: categoria.color }} />
          </div>
          <div>
            <p className="text-base font-black text-[#222222]">{categoria.nombre}</p>
            <p className="text-xs text-[#222222]/50 font-bold">
              {presupuesto ? 'Editar presupuesto' : 'Nuevo presupuesto'}
            </p>
          </div>
        </div>

        <form onSubmit={handleGuardar} className="space-y-4">
          {/* Límite */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wide text-[#222222]/50">
              Límite mensual (€)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={limiteStr}
              onChange={e => setLimiteStr(e.target.value)}
              placeholder="0,00"
              className="w-full bg-[#FFE9CE] border-2 border-[#222222] text-[#222222] placeholder-[#222222]/40 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#FFD80B]"
              autoFocus
            />
          </div>

          {/* Toggle Fijo / Puntual */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#222222] font-black">Repetir cada mes</p>
              <p className="text-xs text-[#222222]/50 mt-0.5 font-medium">
                {esFijo ? 'Se aplica a todos los meses' : `Solo para ${fmtMes(mesAno)}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEsFijo(v => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                esFijo ? 'bg-[#222222]' : 'bg-[#222222]/20'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  esFijo ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          {/* Guardar */}
          <button
            type="submit"
            disabled={loading || !limiteStr || isNaN(limite) || limite <= 0}
            className="w-full bg-[#222222] hover:bg-[#000000] disabled:opacity-50 disabled:cursor-not-allowed text-[#FFD80B] font-black py-3 rounded-xl text-sm transition-colors border-2 border-[#222222]"
          >
            {loading ? 'Guardando...' : 'Guardar presupuesto'}
          </button>
        </form>

        {/* Eliminar (solo si existe presupuesto) */}
        {presupuesto && (
          <button
            onClick={handleEliminar}
            disabled={loadingEliminar}
            className="w-full text-[#FD4C38] hover:text-[#e03020] disabled:opacity-50 text-sm font-black py-2 transition-colors"
          >
            {loadingEliminar ? 'Eliminando...' : 'Eliminar presupuesto'}
          </button>
        )}
      </div>
    </div>
  )
}
