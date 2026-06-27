'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  saldo?: number
}

export default function MovimientoItem({ id, tipo, cantidad, fecha, descripcion, categoria, usuario, categorias, esFijo, gastoFijoId, diaDelMes, saldo }: Props) {
  const [modo, setModo] = useState<'normal' | 'editar' | 'eliminar'>('normal')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

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
      setCargando(false)
      router.refresh()
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
      setCargando(false)
      router.refresh()
    } catch {
      setError('Error al guardar.')
      setCargando(false)
    }
  }

  // Vista: confirmar eliminación
  if (modo === 'eliminar') {
    return (
      <div className="py-3 border-b border-[#222222]/10 last:border-0 space-y-2">
        <p className="text-[#222222] text-sm font-black">¿Eliminar este movimiento?</p>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setModo('normal'); setError('') }}
            className="flex-1 bg-[#FFE9CE] hover:bg-[#FBDDB2] text-[#222222]/60 text-sm font-black py-2 rounded-xl transition-colors border-2 border-[#222222]"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={cargando}
            onClick={handleEliminar}
            className="flex-1 bg-[#FD4C38] hover:bg-[#e03020] disabled:bg-[#FD4C38]/50 text-white text-sm font-black py-2 rounded-xl transition-colors border-2 border-[#222222]"
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
      <div className="py-3 border-b border-[#222222]/10 last:border-0 space-y-3">
        {/* Cantidad */}
        <input
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          value={editCantidad}
          onChange={e => setEditCantidad(e.target.value)}
          placeholder="0.00"
          className="w-full bg-[#FFE9CE] text-[#222222] placeholder-[#222222]/40 rounded-xl px-4 py-2.5 text-base border-2 border-[#222222] focus:outline-none focus:ring-2 focus:ring-[#FFD80B]"
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
                    ? 'border-[#222222] bg-[#FFD80B]/30 border-2'
                    : 'border-[#222222] bg-[#FFE9CE] hover:bg-[#FBDDB2] border-2'
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
          className="w-full max-w-full appearance-none box-border min-w-0 bg-[#FFE9CE] text-[#222222] rounded-xl px-4 py-2.5 text-base border-2 border-[#222222] focus:outline-none focus:ring-2 focus:ring-[#FFD80B]"
        />

        {/* Descripción */}
        <input
          type="text"
          value={editDescripcion}
          onChange={e => setEditDescripcion(e.target.value)}
          placeholder="Descripción (opcional)"
          maxLength={100}
          className="w-full bg-[#FFE9CE] text-[#222222] placeholder-[#222222]/40 rounded-xl px-4 py-2.5 text-base border-2 border-[#222222] focus:outline-none focus:ring-2 focus:ring-[#FFD80B]"
        />

        {/* Gasto fijo */}
        <div
          className="flex items-center justify-between bg-[#FFE9CE] rounded-xl px-3 py-2.5 border-2 border-[#222222] cursor-pointer"
          onClick={() => setEditEsFijo(!editEsFijo)}
        >
          <p className="text-neutral-900 dark:text-white text-sm">Se repite cada mes</p>
          <div className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${editEsFijo ? 'bg-[#222222]' : 'bg-neutral-400 dark:bg-neutral-600'}`}>
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
            className="w-full bg-[#FFE9CE] text-[#222222] rounded-xl px-3 py-2.5 text-base border-2 border-[#222222] focus:outline-none focus:ring-2 focus:ring-[#FFD80B]"
          />
        )}

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setModo('normal'); setError('') }}
            className="flex-1 bg-[#FFE9CE] hover:bg-[#FBDDB2] text-[#222222]/60 text-sm font-black py-2 rounded-xl transition-colors border-2 border-[#222222]"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={cargando}
            onClick={handleGuardarEdicion}
            className="flex-1 bg-[#222222] hover:bg-[#000000] disabled:bg-[#222222]/50 text-[#FFD80B] text-sm font-black py-2 rounded-xl transition-colors border-2 border-[#222222]"
          >
            {cargando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    )
  }

  // Vista: normal
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#222222]/10 last:border-0">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-[#222222]/20"
        style={{ backgroundColor: color + '33' }}
      >
        <Icono className="w-4 h-4" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[#222222] text-sm font-black truncate">
          {categoria?.nombre ?? 'Sin categoría'}
        </p>
        <p className="text-[#222222]/50 text-xs truncate font-medium">
          {descripcion ? `${descripcion} · ` : ''}{formatFecha(fecha)}
          {usuario && ` · ${usuario.nombre ?? usuario.email}`}
          {esFijo && <span className="ml-1 text-[#8B53FF] font-black">· Fijo</span>}
        </p>
      </div>
      <div className="flex flex-col items-end flex-shrink-0">
        <span className={`text-sm font-black ${tipo === 'gasto' ? 'text-[#FD4C38]' : 'text-[#2FA84F]'}`}>
          {tipo === 'gasto' ? '-' : '+'}{fmt(Number(cantidad))} €
        </span>
        {saldo !== undefined && (
          <span className={`text-xs ${saldo < 0 ? 'text-[#FD4C38]' : 'text-[#222222]/30'}`}>
            {fmt(saldo)} €
          </span>
        )}
      </div>
      <div className="flex gap-1 flex-shrink-0">
        <button
          type="button"
          onClick={() => setModo('editar')}
          className="p-1.5 text-[#222222]/30 hover:text-[#222222] transition-colors rounded-lg hover:bg-[#FFE9CE]"
          title="Editar"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setModo('eliminar')}
          className="p-1.5 text-[#222222]/30 hover:text-[#FD4C38] transition-colors rounded-lg hover:bg-[#FFE2DD]"
          title="Eliminar"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
