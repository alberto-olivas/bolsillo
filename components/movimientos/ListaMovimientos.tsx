'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Package } from 'lucide-react'
import { ICONOS } from '@/lib/iconos-categorias'
import MovimientoItem from '@/components/movimientos/MovimientoItem'

type Categoria = {
  id: string
  nombre: string
  icono: string
  color: string
  tipo: string
}

type Movimiento = {
  id: string
  tipo: 'gasto' | 'ingreso'
  cantidad: number
  fecha: string
  descripcion: string | null
  es_fijo: boolean
  gasto_fijo_id: string | null
  categorias: { nombre: string; icono: string; color: string } | null
  perfiles: { nombre: string | null; email: string } | null
  gastos_fijos: { dia_del_mes: number } | null
}

type Props = {
  movimientos: Movimiento[]
  categorias: Categoria[]
  mesAno: string
  proyectoId: string
}

function fmt(n: number) {
  return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDia(fechaStr: string): string {
  const hoy = new Date()
  const ayer = new Date(hoy)
  ayer.setDate(hoy.getDate() - 1)

  const toYMD = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  if (fechaStr === toYMD(hoy)) return 'Hoy'
  if (fechaStr === toYMD(ayer)) return 'Ayer'

  const d = new Date(fechaStr + 'T00:00:00')
  const label = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export default function ListaMovimientos({ movimientos, categorias, mesAno, proyectoId }: Props) {
  const router = useRouter()
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'gasto' | 'ingreso'>('todos')
  const [filtroCat, setFiltroCat] = useState<string | null>(null)

  const [year, month] = mesAno.split('-').map(Number)
  const mesLabel = new Date(year, month - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  function navMes(delta: -1 | 1) {
    let nm = month + delta
    let ny = year
    if (nm < 1) { nm = 12; ny-- }
    if (nm > 12) { nm = 1; ny++ }
    const nuevo = `${ny}-${String(nm).padStart(2, '0')}`
    router.push(`/proyectos/${proyectoId}?mes=${nuevo}`)
  }

  // Filtrado
  const filtrados = movimientos.filter(m => {
    if (filtroTipo !== 'todos' && m.tipo !== filtroTipo) return false
    if (filtroCat !== null) {
      const catNombre = m.categorias?.nombre
      const catObj = categorias.find(c => c.id === filtroCat)
      if (!catObj || catNombre !== catObj.nombre) return false
    }
    return true
  })

  // Agrupación por día
  const grupos: Record<string, typeof filtrados> = {}
  for (const m of filtrados) {
    if (!grupos[m.fecha]) grupos[m.fecha] = []
    grupos[m.fecha].push(m)
  }
  const dias = Object.keys(grupos).sort((a, b) => b.localeCompare(a))

  // Categorías únicas presentes en los movimientos del mes (para filtro)
  const catIds = new Set(
    movimientos.map(m => categorias.find(c => c.nombre === m.categorias?.nombre)?.id).filter(Boolean)
  )
  const catsPresentes = categorias.filter(c => catIds.has(c.id))

  return (
    <div className="space-y-4">
      {/* Selector de mes */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navMes(-1)}
          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-white font-medium capitalize text-sm">{mesLabel}</span>
        <button
          type="button"
          onClick={() => navMes(1)}
          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Filtro por tipo */}
      <div className="flex gap-2">
        {(['todos', 'gasto', 'ingreso'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setFiltroTipo(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filtroTipo === t
                ? 'bg-indigo-600 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            {t === 'todos' ? 'Todos' : t === 'gasto' ? 'Gastos' : 'Ingresos'}
          </button>
        ))}
      </div>

      {/* Filtro por categoría (scroll horizontal) */}
      {catsPresentes.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            type="button"
            onClick={() => setFiltroCat(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filtroCat === null
                ? 'bg-indigo-600 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            Todas
          </button>
          {catsPresentes.map(cat => {
            const Icono = ICONOS[cat.icono] ?? Package
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFiltroCat(filtroCat === cat.id ? null : cat.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filtroCat === cat.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                }`}
              >
                <Icono className="w-3 h-3" style={{ color: filtroCat === cat.id ? 'white' : cat.color }} />
                {cat.nombre}
              </button>
            )
          })}
        </div>
      )}

      {/* Lista agrupada por día */}
      {dias.length > 0 ? (
        <div className="space-y-4">
          {dias.map(dia => {
            const items = grupos[dia]
            const totalDia = items.reduce((sum, m) =>
              sum + (m.tipo === 'ingreso' ? Number(m.cantidad) : -Number(m.cantidad)), 0
            )
            return (
              <div key={dia} className="space-y-1">
                {/* Cabecera del día */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-neutral-400 text-xs font-medium">{formatDia(dia)}</span>
                  <span className={`text-xs font-semibold ${totalDia >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {totalDia >= 0 ? '+' : ''}{fmt(totalDia)} €
                  </span>
                </div>
                {/* Movimientos del día */}
                <div className="bg-neutral-900 rounded-2xl px-5 border border-neutral-800">
                  {items.map(m => (
                    <MovimientoItem
                      key={m.id}
                      id={m.id}
                      tipo={m.tipo}
                      cantidad={m.cantidad}
                      fecha={m.fecha}
                      descripcion={m.descripcion}
                      categoria={m.categorias as any}
                      usuario={m.perfiles as any}
                      categorias={categorias}
                      esFijo={m.es_fijo ?? false}
                      gastoFijoId={m.gasto_fijo_id ?? null}
                      diaDelMes={(m.gastos_fijos as any)?.dia_del_mes ?? null}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800 text-center">
          <p className="text-neutral-500 text-sm">Sin movimientos este mes.</p>
          <p className="text-neutral-600 text-xs mt-1">Añade tu primer gasto o ingreso.</p>
        </div>
      )}
    </div>
  )
}
