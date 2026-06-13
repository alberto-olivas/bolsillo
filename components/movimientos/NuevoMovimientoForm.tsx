'use client'

import { useState } from 'react'
import { crearMovimiento } from '@/app/actions/movimientos'
import { ICONOS } from '@/lib/iconos-categorias'
import { Plus, Package } from 'lucide-react'

type Categoria = {
  id: string
  nombre: string
  icono: string
  color: string
  tipo: string
}

type Props = {
  proyectoId: string
  categorias: Categoria[]
  mesAno: string
}

function fechaPorDefecto(mesAno: string): string {
  const hoy = new Date()
  const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
  if (mesAno === mesActual) return hoy.toISOString().split('T')[0]
  const [y, m] = mesAno.split('-').map(Number)
  if (mesAno < mesActual) {
    return new Date(y, m, 0).toISOString().split('T')[0]
  }
  return `${mesAno}-01`
}

export default function NuevoMovimientoForm({ proyectoId, categorias, mesAno }: Props) {
  const [abierto, setAbierto] = useState(false)
  const [tipo, setTipo] = useState<'gasto' | 'ingreso'>('gasto')
  const [cantidad, setCantidad] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [fecha, setFecha] = useState(() => fechaPorDefecto(mesAno))
  const [descripcion, setDescripcion] = useState('')
  const [esFijo, setEsFijo] = useState(false)
  const [diaDelMes, setDiaDelMes] = useState(1)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const categoriasFiltradas = categorias.filter(c => c.tipo === tipo)

  function handleCambiarTipo(t: 'gasto' | 'ingreso') {
    setTipo(t)
    setCategoriaId('')
  }

  async function handleGuardar() {
    const cantidadNum = parseFloat(cantidad)
    if (!cantidad || isNaN(cantidadNum) || cantidadNum <= 0) {
      setError('Introduce una cantidad válida')
      return
    }
    if (!categoriaId) {
      setError('Selecciona una categoría')
      return
    }
    setCargando(true)
    setError('')
    try {
      await crearMovimiento(proyectoId, tipo, cantidadNum, categoriaId, fecha, descripcion || undefined, esFijo, esFijo ? diaDelMes : undefined)
      window.location.reload()
    } catch {
      setError('Error al guardar. Inténtalo de nuevo.')
      setCargando(false)
    }
  }

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-2xl py-4 transition-colors text-sm"
      >
        <Plus className="w-4 h-4" />
        Nuevo movimiento
      </button>
    )
  }

  return (
    <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl p-5 border border-indigo-800 space-y-4">
      <p className="text-neutral-900 dark:text-white font-medium text-sm">Nuevo movimiento</p>

      {/* Tipo */}
      <div className="grid grid-cols-2 gap-2">
        {(['gasto', 'ingreso'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => handleCambiarTipo(t)}
            className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
              tipo === t
                ? 'bg-indigo-600 text-white'
                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-300 dark:hover:bg-neutral-700'
            }`}
          >
            {t === 'gasto' ? 'Gasto' : 'Ingreso'}
          </button>
        ))}
      </div>

      {/* Cantidad */}
      <div className="space-y-1.5">
        <label className="text-xs text-neutral-600 dark:text-neutral-400">Cantidad (€)</label>
        <input
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          value={cantidad}
          onChange={e => setCantidad(e.target.value)}
          placeholder="0.00"
          className="w-full bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 rounded-xl px-4 py-3 text-sm border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Categoría */}
      <div className="space-y-1.5">
        <label className="text-xs text-neutral-600 dark:text-neutral-400">Categoría</label>
        <div className="grid grid-cols-4 gap-2">
          {categoriasFiltradas.map(cat => {
            const Icono = ICONOS[cat.icono] ?? Package
            const seleccionada = categoriaId === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoriaId(cat.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors border ${
                  seleccionada
                    ? 'border-indigo-500 bg-indigo-600/20'
                    : 'border-neutral-300 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700'
                }`}
              >
                <Icono className="w-4 h-4" style={{ color: cat.color }} />
                <span className="text-xs text-neutral-700 dark:text-neutral-300 leading-tight text-center">{cat.nombre}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Fecha */}
      <div className="space-y-1.5">
        <label className="text-xs text-neutral-600 dark:text-neutral-400">Fecha</label>
        <input
          type="date"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
          className="w-full bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-xl px-4 py-3 text-sm border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Descripción */}
      <div className="space-y-1.5">
        <label className="text-xs text-neutral-600 dark:text-neutral-400">
          Descripción <span className="text-neutral-400 dark:text-neutral-600">(opcional)</span>
        </label>
        <input
          type="text"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          placeholder="Ej: Mercadona"
          maxLength={100}
          className="w-full bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 rounded-xl px-4 py-3 text-sm border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Gasto fijo */}
      <div
        className="flex items-center justify-between bg-neutral-200 dark:bg-neutral-800 rounded-xl px-4 py-3 border border-neutral-300 dark:border-neutral-700 cursor-pointer"
        onClick={() => setEsFijo(!esFijo)}
      >
        <div>
          <p className="text-neutral-900 dark:text-white text-sm">Se repite cada mes</p>
          <p className="text-neutral-500 text-xs">Guardará una plantilla de gasto fijo</p>
        </div>
        <div className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${esFijo ? 'bg-indigo-600' : 'bg-neutral-400 dark:bg-neutral-600'}`}>
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${esFijo ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </div>
      </div>

      {esFijo && (
        <div className="space-y-1.5">
          <label className="text-xs text-neutral-600 dark:text-neutral-400">Día del mes en que se repite</label>
          <input
            type="number"
            min="1"
            max="31"
            value={diaDelMes}
            onChange={e => setDiaDelMes(Math.min(31, Math.max(1, Number(e.target.value))))}
            className="w-full bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-xl px-4 py-3 text-sm border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
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
          onClick={handleGuardar}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:text-indigo-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          {cargando ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}
