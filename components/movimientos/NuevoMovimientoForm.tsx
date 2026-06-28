'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()

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
      setCargando(false)
      setAbierto(false)
      setTipo('gasto')
      setCantidad('')
      setCategoriaId('')
      setFecha(fechaPorDefecto(mesAno))
      setDescripcion('')
      setEsFijo(false)
      setDiaDelMes(1)
      setError('')
      router.refresh()
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
        className="w-full flex items-center justify-center gap-2 bg-[#222222] hover:bg-[#000000] text-[#FFD80B] font-black rounded-2xl py-4 transition-colors text-sm border-2 border-[#222222]"
        style={{ boxShadow: '4px 4px 0px 0px var(--shadow-main)' }}
      >
        <Plus className="w-4 h-4" />
        Nuevo movimiento
      </button>
    )
  }

  return (
    <div className="bg-[#FFF8EC] dark:bg-[#2A2420] rounded-2xl p-5 border-2 border-[#222222] dark:border-[#F5E6D0] space-y-4" style={{ boxShadow: '4px 4px 0px 0px var(--shadow-main)' }}>
      <p className="text-[#222222] dark:text-[#F5E6D0] font-black text-base">Nuevo movimiento</p>

      {/* Tipo */}
      <div className="grid grid-cols-2 gap-2">
        {(['gasto', 'ingreso'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => handleCambiarTipo(t)}
            className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
              tipo === t
                ? 'bg-[#222222] text-[#FFD80B]'
                : 'bg-[#FFE9CE] dark:bg-[#332E28] text-[#222222]/50 dark:text-[#F5E6D0]/50 hover:bg-[#FBDDB2] dark:hover:bg-[#3A3228]'
            }`}
          >
            {t === 'gasto' ? 'Gasto' : 'Ingreso'}
          </button>
        ))}
      </div>

      {/* Cantidad */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-wide text-[#222222]/50 dark:text-[#F5E6D0]/50">Cantidad (€)</label>
        <input
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          value={cantidad}
          onChange={e => setCantidad(e.target.value)}
          placeholder="0.00"
          className="w-full bg-[#FFE9CE] dark:bg-[#332E28] text-[#222222] dark:text-[#F5E6D0] placeholder-[#222222]/40 dark:placeholder-[#F5E6D0]/40 rounded-xl px-4 py-3 text-base border-2 border-[#222222] dark:border-[#F5E6D0] focus:outline-none focus:ring-2 focus:ring-[#FFD80B]"
        />
      </div>

      {/* Categoría */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-wide text-[#222222]/50 dark:text-[#F5E6D0]/50">Categoría</label>
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
                    ? 'border-[#222222] dark:border-[#F5E6D0] bg-[#FFD80B]/30 border-2'
                    : 'border-[#222222] dark:border-[#F5E6D0] bg-[#FFE9CE] dark:bg-[#332E28] hover:bg-[#FBDDB2] dark:hover:bg-[#3A3228] border-2'
                }`}
              >
                <Icono className="w-4 h-4" style={{ color: cat.color }} />
                <span className="text-xs text-[#222222] dark:text-[#F5E6D0] leading-tight text-center">{cat.nombre}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Fecha */}
      <div className="space-y-1.5 overflow-hidden">
        <label className="text-[10px] font-black uppercase tracking-wide text-[#222222]/50 dark:text-[#F5E6D0]/50">Fecha</label>
        <input
          type="date"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
          className="w-full max-w-full appearance-none box-border min-w-0 bg-[#FFE9CE] dark:bg-[#332E28] text-[#222222] dark:text-[#F5E6D0] rounded-xl px-4 py-3 text-base border-2 border-[#222222] dark:border-[#F5E6D0] focus:outline-none focus:ring-2 focus:ring-[#FFD80B]"
        />
      </div>

      {/* Descripción */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-wide text-[#222222]/50 dark:text-[#F5E6D0]/50">
          Descripción <span className="text-[#222222]/40 dark:text-[#F5E6D0]/40">(opcional)</span>
        </label>
        <input
          type="text"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          placeholder="Ej: Mercadona"
          maxLength={100}
          className="w-full bg-[#FFE9CE] dark:bg-[#332E28] text-[#222222] dark:text-[#F5E6D0] placeholder-[#222222]/40 dark:placeholder-[#F5E6D0]/40 rounded-xl px-4 py-3 text-base border-2 border-[#222222] dark:border-[#F5E6D0] focus:outline-none focus:ring-2 focus:ring-[#FFD80B]"
        />
      </div>

      {/* Gasto fijo */}
      <div
        className="flex items-center justify-between bg-[#FFE9CE] dark:bg-[#332E28] rounded-xl px-4 py-3 border-2 border-[#222222] dark:border-[#F5E6D0] cursor-pointer"
        onClick={() => setEsFijo(!esFijo)}
      >
        <div>
          <p className="text-[#222222] dark:text-[#F5E6D0] text-sm">Se repite cada mes</p>
          <p className="text-[#222222]/50 dark:text-[#F5E6D0]/50 text-xs">Guardará una plantilla de gasto fijo</p>
        </div>
        <div className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${esFijo ? 'bg-[#222222] dark:bg-[#F5E6D0]' : 'bg-[#222222]/30 dark:bg-[#F5E6D0]/30'}`}>
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${esFijo ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </div>
      </div>

      {esFijo && (
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wide text-[#222222]/50 dark:text-[#F5E6D0]/50">Día del mes en que se repite</label>
          <input
            type="number"
            min="1"
            max="31"
            value={diaDelMes}
            onChange={e => setDiaDelMes(Math.min(31, Math.max(1, Number(e.target.value))))}
            className="w-full bg-[#FFE9CE] dark:bg-[#332E28] text-[#222222] dark:text-[#F5E6D0] rounded-xl px-4 py-3 text-base border-2 border-[#222222] dark:border-[#F5E6D0] focus:outline-none focus:ring-2 focus:ring-[#FFD80B]"
          />
        </div>
      )}

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setAbierto(false); setError('') }}
          className="flex-1 bg-[#FFE9CE] dark:bg-[#332E28] hover:bg-[#FBDDB2] dark:hover:bg-[#3A3228] text-[#222222]/60 dark:text-[#F5E6D0]/60 font-black py-3 rounded-xl transition-colors text-sm border-2 border-[#222222] dark:border-[#F5E6D0]"
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
  )
}
