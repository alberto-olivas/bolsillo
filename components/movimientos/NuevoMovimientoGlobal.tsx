'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { crearMovimiento } from '@/app/actions/movimientos'
import { ICONOS } from '@/lib/iconos-categorias'
import { Package } from 'lucide-react'

type Categoria = {
  id: string
  nombre: string
  icono: string
  color: string
  tipo: string
}

function mesActual() {
  const hoy = new Date()
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
}

function fechaHoy() {
  return new Date().toISOString().split('T')[0]
}

export default function NuevoMovimientoGlobal({
  proyectoId,
  categorias,
}: {
  proyectoId: string
  categorias: Categoria[]
}) {
  const [abierto, setAbierto] = useState(false)
  const [tipo, setTipo] = useState<'gasto' | 'ingreso'>('gasto')
  const [cantidad, setCantidad] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [fecha, setFecha] = useState(fechaHoy)
  const [descripcion, setDescripcion] = useState('')
  const [esFijo, setEsFijo] = useState(false)
  const [diaDelMes, setDiaDelMes] = useState(1)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const handler = () => {
      setFecha(fechaHoy())
      setAbierto(true)
    }
    window.addEventListener('abrir-nuevo-movimiento', handler)
    return () => window.removeEventListener('abrir-nuevo-movimiento', handler)
  }, [])

  const categoriasFiltradas = categorias.filter(c => c.tipo === tipo)

  function handleCambiarTipo(t: 'gasto' | 'ingreso') {
    setTipo(t)
    setCategoriaId('')
  }

  function handleClose() {
    setAbierto(false)
    setError('')
    setTipo('gasto')
    setCantidad('')
    setCategoriaId('')
    setFecha(fechaHoy())
    setDescripcion('')
    setEsFijo(false)
    setDiaDelMes(1)
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
      setCargando(false)
      handleClose()
      router.refresh()
    } catch {
      setError('Error al guardar. Inténtalo de nuevo.')
      setCargando(false)
    }
  }

  if (!abierto) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[#222222]/60"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-sm bg-[#FFF8EC] rounded-t-3xl p-6 pb-10 space-y-4 max-h-[90vh] overflow-y-auto border-t-2 border-x-2 border-[#222222]"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-[#222222]/20 rounded-full mx-auto" />

        <p className="text-[#222222] font-black text-base">Nuevo movimiento</p>

        {/* Tipo */}
        <div className="grid grid-cols-2 gap-2">
          {(['gasto', 'ingreso'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => handleCambiarTipo(t)}
              className={`py-2.5 rounded-xl text-sm font-black transition-colors border-2 border-[#222222] ${
                tipo === t
                  ? 'bg-[#222222] text-[#FFD80B]'
                  : 'bg-[#FFE9CE] text-[#222222]/50 hover:bg-[#FBDDB2]'
              }`}
            >
              {t === 'gasto' ? '💸 Gasto' : '💰 Ingreso'}
            </button>
          ))}
        </div>

        {/* Cantidad */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wide text-[#222222]/50">Cantidad (€)</label>
          <input
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            value={cantidad}
            onChange={e => setCantidad(e.target.value)}
            placeholder="0.00"
            autoFocus
            className="w-full bg-[#FFE9CE] text-[#222222] placeholder-[#222222]/40 rounded-xl px-4 py-3 text-base border-2 border-[#222222] focus:outline-none focus:ring-2 focus:ring-[#FFD80B]"
          />
        </div>

        {/* Categoría */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wide text-[#222222]/50">Categoría</label>
          <div className="grid grid-cols-4 gap-2">
            {categoriasFiltradas.map(cat => {
              const Icono = ICONOS[cat.icono] ?? Package
              const seleccionada = categoriaId === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoriaId(cat.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors border-2 ${
                    seleccionada
                      ? 'border-[#222222] bg-[#FFD80B]/30'
                      : 'border-[#222222] bg-[#FFE9CE] hover:bg-[#FBDDB2]'
                  }`}
                >
                  <Icono className="w-4 h-4" style={{ color: cat.color }} />
                  <span className="text-[10px] font-black text-[#222222] leading-tight text-center">{cat.nombre}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Fecha */}
        <div className="space-y-1.5 overflow-hidden">
          <label className="text-[10px] font-black uppercase tracking-wide text-[#222222]/50">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            className="w-full max-w-full appearance-none box-border min-w-0 bg-[#FFE9CE] text-[#222222] rounded-xl px-4 py-3 text-base border-2 border-[#222222] focus:outline-none focus:ring-2 focus:ring-[#FFD80B]"
          />
        </div>

        {/* Descripción */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wide text-[#222222]/50">
            Descripción <span className="text-[#222222]/30 normal-case font-bold">(opcional)</span>
          </label>
          <input
            type="text"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder="Ej: Mercadona"
            maxLength={100}
            className="w-full bg-[#FFE9CE] text-[#222222] placeholder-[#222222]/40 rounded-xl px-4 py-3 text-base border-2 border-[#222222] focus:outline-none focus:ring-2 focus:ring-[#FFD80B]"
          />
        </div>

        {/* Gasto fijo */}
        <div
          className="flex items-center justify-between bg-[#FFE9CE] rounded-xl px-4 py-3 border-2 border-[#222222] cursor-pointer"
          onClick={() => setEsFijo(!esFijo)}
        >
          <div>
            <p className="text-[#222222] text-sm font-black">Se repite cada mes</p>
            <p className="text-[#222222]/50 text-xs font-medium">Guardará una plantilla de gasto fijo</p>
          </div>
          <div className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${esFijo ? 'bg-[#222222]' : 'bg-[#222222]/20'}`}>
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${esFijo ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
        </div>

        {esFijo && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wide text-[#222222]/50">Día del mes en que se repite</label>
            <input
              type="number"
              min="1"
              max="31"
              value={diaDelMes}
              onChange={e => setDiaDelMes(Math.min(31, Math.max(1, Number(e.target.value))))}
              className="w-full bg-[#FFE9CE] text-[#222222] rounded-xl px-4 py-3 text-base border-2 border-[#222222] focus:outline-none focus:ring-2 focus:ring-[#FFD80B]"
            />
          </div>
        )}

        {error && (
          <p className="text-[#FD4C38] text-xs font-black bg-[#FFE2DD] px-3 py-2 rounded-xl border-2 border-[#FD4C38]">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 bg-[#FFE9CE] hover:bg-[#FBDDB2] text-[#222222]/60 font-black py-3 rounded-xl transition-colors text-sm border-2 border-[#222222]"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={cargando}
            onClick={handleGuardar}
            className="flex-1 bg-[#222222] hover:bg-[#000000] disabled:bg-[#222222]/50 text-[#FFD80B] font-black py-3 rounded-xl transition-colors text-sm border-2 border-[#222222]"
          >
            {cargando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
