'use client'

import { useState } from 'react'
import { ICONOS } from '@/lib/iconos-categorias'
import { Package, Pencil, Trash2 } from 'lucide-react'
import { editarMovimiento, eliminarMovimiento } from '@/app/actions/movimientos'

type Categoria = {
  id: string
  nombre: string
  icono: string
  color: string
  tipo: string
}

type Props = {
  id: string
  tipo: 'gasto' | 'ingreso'
  cantidad: number | string
  fecha: string
  descripcion: string | null
  categoria: { nombre: string; icono: string; color: string } | null
  usuario: { nombre: string | null; email: string } | null
  categorias: Categoria[]
  esFijo: boolean
  gastoFijoId: string | null
  diaDelMes: number | null
}

export default function MovimientoItem({ id, tipo, cantidad, fecha, descripcion, categoria, usuario, categorias, esFijo, gastoFijoId, diaDelMes }: Props) {
  const [modo, setModo] = useState<'normal' | 'editar' | 'eliminar'>('normal')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const [editCantidad, setEditCantidad] = useState(String(Number(cantidad)))
  const [editCategoriaId, setEditCategoriaId] = useState(categoria ? (categorias.find(c => c.nombre === categoria.nombre)?.id ?? '') : '')
  const [editFecha, setEditFecha] = useState(fecha)
  const [editDescripcion, setEditDescripcion] = useState(descripcion ?? '')
  const [editEsFijo, setEditEsFijo] = useState(esFijo)
  const [editDiaDelMes, setEditDiaDelMes] = useState(diaDelMes ?? 1)

  const Icono = categoria ? (ICONOS[categoria.icono] ?? Package) : Package
  const color = categoria?.color ?? '#6b7280'
  const categoriasFiltradas = categorias.filter(c => c.tipo === tipo)

  function formatFecha(f: string) {
    const d = new Date(f + 'T00:00:00')
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }

  function fmt(n: number) {
    return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  async function handleEliminar() {
    setCargando(true)
    setError('')
    try {
      await eliminarMovimiento(id)
      window.location.reload()
    } catch {
      setError('Error al eliminar.')
      setCargando(false)
    }
  }

  async function handleGuardarEdicion() {
    const cantidadNum = parseFloat(editCantidad)
    if (!editCantidad || isNaN(cantidadNum) || cantidadNum <= 0) {
      setError('Introduce una cantidad válida')
      return
    }
    if (!editCategoriaId) {
      setError('Selecciona una categoría')
      return
    }
    setCargando(true)
    setError('')
    try {
      await editarMovimiento(id, cantidadNum, editCategoriaId, editFecha, editDescripcion || undefined, editEsFijo, editEsFijo ? editDiaDelMes : undefined, gastoFijoId)
      window.location.reload()
    } catch {
      setError('Error al guardar.')
      setCargando(false)
    }
  }

  // Vista: confirmar eliminación
  if (modo === 'eliminar') {
    return (
      <div className="py-3 border-b border-neutral-200 dark:border-neutral-800 last:border-0 space-y-2">
        <p className="text-neutral-900 dark:text-white text-sm">¿Eliminar este movimiento?</p>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setModo('normal'); setError('') }}
            className="flex-1 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 text-sm font-medium py-2 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={cargando}
            onClick={handleEliminar}
            className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-red-900 disabled:text-red-400 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
          >
            {cargando ? 'Eliminando...' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    )
  }

  // Vista: formulario de edición
  if (modo === 'editar') {
    return (
      <div className="py-3 border-b border-neutral-200 dark:border-neutral-800 last:border-0 space-y-3">
        {/* Cantidad */}
        <input
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          value={editCantidad}
          onChange={e => setEditCantidad(e.target.value)}
          placeholder="0.00"
          className="w-full bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 rounded-xl px-4 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-indigo-500"
        />

        {/* Categoría */}
        <div className="grid grid-cols-4 gap-1.5">
          {categoriasFiltradas.map(cat => {
            const CatIcono = ICONOS[cat.icono] ?? Package
            const seleccionada = editCategoriaId === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setEditCategoriaId(cat.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors border ${
                  seleccionada
                    ? 'border-indigo-500 bg-indigo-600/20'
                    : 'border-neutral-300 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700'
                }`}
              >
                <CatIcono className="w-4 h-4" style={{ color: cat.color }} />
                <span className="text-xs text-neutral-700 dark:text-neutral-300 leading-tight text-center">{cat.nombre}</span>
              </button>
            )
          })}
        </div>

        {/* Fecha */}
        <input
          type="date"
          value={editFecha}
          onChange={e => setEditFecha(e.target.value)}
          className="w-full bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-xl px-4 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-indigo-500"
        />

        {/* Descripción */}
        <input
          type="text"
          value={editDescripcion}
          onChange={e => setEditDescripcion(e.target.value)}
          placeholder="Descripción (opcional)"
          maxLength={100}
          className="w-full bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 rounded-xl px-4 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-indigo-500"
        />

        {/* Gasto fijo */}
        <div
          className="flex items-center justify-between bg-neutral-200 dark:bg-neutral-800 rounded-xl px-3 py-2.5 border border-neutral-300 dark:border-neutral-700 cursor-pointer"
          onClick={() => setEditEsFijo(!editEsFijo)}
        >
          <p className="text-neutral-900 dark:text-white text-sm">Se repite cada mes</p>
          <div className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${editEsFijo ? 'bg-indigo-600' : 'bg-neutral-400 dark:bg-neutral-600'}`}>
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${editEsFijo ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
        </div>

        {editEsFijo && (
          <input
            type="number"
            min="1"
            max="31"
            value={editDiaDelMes}
            onChange={e => setEditDiaDelMes(Math.min(31, Math.max(1, Number(e.target.value))))}
            placeholder="Día del mes (1-31)"
            className="w-full bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-xl px-3 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-indigo-500"
          />
        )}

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setModo('normal'); setError('') }}
            className="flex-1 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 text-sm font-medium py-2 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={cargando}
            onClick={handleGuardarEdicion}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:text-indigo-400 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
          >
            {cargando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    )
  }

  // Vista: normal
  return (
    <div className="flex items-center gap-3 py-3 border-b border-neutral-200 dark:border-neutral-800 last:border-0">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: color + '33' }}
      >
        <Icono className="w-4 h-4" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-neutral-900 dark:text-white text-sm font-medium truncate">
          {categoria?.nombre ?? 'Sin categoría'}
        </p>
        <p className="text-neutral-500 text-xs truncate">
          {descripcion ? `${descripcion} · ` : ''}{formatFecha(fecha)}
          {usuario && ` · ${usuario.nombre ?? usuario.email}`}
          {esFijo && <span className="ml-1 text-indigo-400">· Fijo</span>}
        </p>
      </div>
      <span className={`text-sm font-semibold flex-shrink-0 ${tipo === 'gasto' ? 'text-red-400' : 'text-green-400'}`}>
        {tipo === 'gasto' ? '-' : '+'}{fmt(Number(cantidad))} €
      </span>
      <div className="flex gap-1 flex-shrink-0">
        <button
          type="button"
          onClick={() => setModo('editar')}
          className="p-1.5 text-neutral-400 dark:text-neutral-600 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
          title="Editar"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setModo('eliminar')}
          className="p-1.5 text-neutral-400 dark:text-neutral-600 hover:text-red-400 transition-colors rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
          title="Eliminar"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
