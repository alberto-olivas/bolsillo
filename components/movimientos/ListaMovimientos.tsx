'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Package } from 'lucide-react'
import { ICONOS } from '@/lib/iconos-categorias'
import { mesAnterior, mesSiguiente } from '@/lib/utils-fecha'
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
  initialCat?: string
  busqueda?: string
  saldoPorId?: Record<string, number>
  ocultarSelectorMes?: boolean
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

function formatMes(mesStr: string): string {
  const [y, m] = mesStr.split('-').map(Number)
  const label = new Date(y, m - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export default function ListaMovimientos({ movimientos, categorias, mesAno, proyectoId, initialCat, busqueda, saldoPorId, ocultarSelectorMes }: Props) {
  const router = useRouter()
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'gasto' | 'ingreso'>('todos')
  const [filtroCat, setFiltroCat] = useState<string | null>(initialCat ?? null)

  const [year, month] = mesAno.split('-').map(Number)
  const mesLabel = new Date(year, month - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  const modoBusqueda = busqueda !== undefined

  function navMes(delta: -1 | 1) {
    const nuevo = delta === -1 ? mesAnterior(mesAno) : mesSiguiente(mesAno)
    router.push(`/proyectos/${proyectoId}?mes=${nuevo}`)
  }

  // Filtrado según modo
  const filtrados = modoBusqueda
    ? (() => {
        const q = busqueda.toLowerCase()
        if (!q) return movimientos
        return movimientos.filter(m => {
          const desc = (m.descripcion ?? '').toLowerCase()
          const cat = (m.categorias?.nombre ?? '').toLowerCase()
          return desc.includes(q) || cat.includes(q)
        })
      })()
    : movimientos.filter(m => {
        if (filtroTipo !== 'todos' && m.tipo !== filtroTipo) return false
        if (filtroCat !== null) {
          const catNombre = m.categorias?.nombre
          const catObj = categorias.find(c => c.id === filtroCat)
          if (!catObj || catNombre !== catObj.nombre) return false
        }
        return true
      })

  // Agrupación según modo
  if (modoBusqueda) {
    // Agrupar por mes (YYYY-MM)
    const gruposMes: Record<string, typeof filtrados> = {}
    for (const m of filtrados) {
      const mes = m.fecha.slice(0, 7)
      if (!gruposMes[mes]) gruposMes[mes] = []
      gruposMes[mes].push(m)
    }
    const meses = Object.keys(gruposMes).sort((a, b) => b.localeCompare(a))

    return (
      <div className="space-y-4">
        {meses.length > 0 ? (
          meses.map(mes => {
            const items = gruposMes[mes]
            return (
              <div key={mes} className="space-y-1">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[#222222]/50 dark:text-[#F5E6D0]/50 text-[10px] font-black uppercase tracking-wide capitalize">
                    {formatMes(mes)}
                  </span>
                  <span className="text-[#222222]/40 dark:text-[#F5E6D0]/40 text-xs font-medium">
                    {items.length} {items.length === 1 ? 'resultado' : 'resultados'}
                  </span>
                </div>
                <div className="bg-[#FFF8EC] dark:bg-[#2A2420] rounded-2xl px-5 border-2 border-[#222222] dark:border-[#F5E6D0]" style={{ boxShadow: '3px 3px 0px 0px var(--shadow-main)' }}>
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
                      saldo={saldoPorId?.[m.id]}
                    />
                  ))}
                </div>
              </div>
            )
          })
        ) : (
          <div className="bg-[#FFF8EC] dark:bg-[#2A2420] rounded-2xl p-6 border-2 border-[#222222] dark:border-[#F5E6D0] text-center">
            {busqueda ? (
              <>
                <p className="text-[#222222]/60 dark:text-[#F5E6D0]/60 text-sm font-bold">Sin resultados para «{busqueda}».</p>
                <p className="text-[#222222]/40 dark:text-[#F5E6D0]/40 text-xs mt-1 font-medium">Prueba con otro término.</p>
              </>
            ) : (
              <p className="text-[#222222]/60 dark:text-[#F5E6D0]/60 text-sm font-bold">No hay movimientos en este proyecto.</p>
            )}
          </div>
        )}
      </div>
    )
  }

  // Modo normal: agrupar por día
  const grupos: Record<string, typeof filtrados> = {}
  for (const m of filtrados) {
    if (!grupos[m.fecha]) grupos[m.fecha] = []
    grupos[m.fecha].push(m)
  }
  const dias = Object.keys(grupos).sort((a, b) => b.localeCompare(a))

  const catIds = new Set(
    movimientos.map(m => categorias.find(c => c.nombre === m.categorias?.nombre)?.id).filter(Boolean)
  )
  const catsPresentes = categorias.filter(c => catIds.has(c.id))

  return (
    <div className="space-y-4">
      {/* Selector de mes */}
      {!ocultarSelectorMes && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navMes(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-[#222222] dark:border-[#F5E6D0] bg-[#FFE9CE] dark:bg-[#332E28] hover:bg-[#FBDDB2] dark:hover:bg-[#3A3228] text-[#222222] dark:text-[#F5E6D0] transition-colors"
            style={{ boxShadow: '2px 2px 0px 0px var(--shadow-main)' }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-[#222222] dark:text-[#F5E6D0] font-black capitalize text-sm">{mesLabel}</span>
          <button
            type="button"
            onClick={() => navMes(1)}
            className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-[#222222] dark:border-[#F5E6D0] bg-[#FFE9CE] dark:bg-[#332E28] hover:bg-[#FBDDB2] dark:hover:bg-[#3A3228] text-[#222222] dark:text-[#F5E6D0] transition-colors"
            style={{ boxShadow: '2px 2px 0px 0px var(--shadow-main)' }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Filtro por tipo */}
      <div className="flex gap-2">
        {(['todos', 'gasto', 'ingreso'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setFiltroTipo(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-colors ${
              filtroTipo === t
                ? 'bg-[#222222] text-[#FFD80B]'
                : 'bg-[#FFE9CE] dark:bg-[#332E28] text-[#222222]/60 dark:text-[#F5E6D0]/60 hover:bg-[#FBDDB2] dark:hover:bg-[#3A3228] border-2 border-[#222222] dark:border-[#F5E6D0]'
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
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-black transition-colors ${
              filtroCat === null
                ? 'bg-[#222222] text-[#FFD80B]'
                : 'bg-[#FFE9CE] dark:bg-[#332E28] text-[#222222]/60 dark:text-[#F5E6D0]/60 hover:bg-[#FBDDB2] dark:hover:bg-[#3A3228] border-2 border-[#222222] dark:border-[#F5E6D0]'
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
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-colors ${
                  filtroCat === cat.id
                    ? 'bg-[#222222] text-[#FFD80B]'
                    : 'bg-[#FFE9CE] dark:bg-[#332E28] text-[#222222]/60 dark:text-[#F5E6D0]/60 hover:bg-[#FBDDB2] dark:hover:bg-[#3A3228] border-2 border-[#222222] dark:border-[#F5E6D0]'
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
                <div className="flex items-center justify-between px-1">
                  <span className="text-[#222222]/50 dark:text-[#F5E6D0]/50 text-[10px] font-black uppercase tracking-wide">{formatDia(dia)}</span>
                  <span className={`text-xs font-black ${totalDia >= 0 ? 'text-[#2FA84F]' : 'text-[#FD4C38]'}`}>
                    {totalDia >= 0 ? '+' : ''}{fmt(totalDia)} €
                  </span>
                </div>
                <div className="bg-[#FFF8EC] dark:bg-[#2A2420] rounded-2xl px-5 border-2 border-[#222222] dark:border-[#F5E6D0]" style={{ boxShadow: '3px 3px 0px 0px var(--shadow-main)' }}>
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
                      saldo={saldoPorId?.[m.id]}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-[#FFF8EC] dark:bg-[#2A2420] rounded-2xl p-6 border-2 border-[#222222] dark:border-[#F5E6D0] text-center">
          <p className="text-[#222222]/60 dark:text-[#F5E6D0]/60 text-sm font-bold">Sin movimientos este mes.</p>
          <p className="text-[#222222]/40 dark:text-[#F5E6D0]/40 text-xs mt-1 font-medium">Añade tu primer gasto o ingreso.</p>
        </div>
      )}
    </div>
  )
}
