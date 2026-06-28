export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { createClient, getCachedUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BarChart3 } from 'lucide-react'
import NuevoMovimientoForm from '@/components/movimientos/NuevoMovimientoForm'
import ResumenMes from '@/components/movimientos/ResumenMes'
import PendientesConfirmar from '@/components/movimientos/PendientesConfirmar'
import ListaMovimientos from '@/components/movimientos/ListaMovimientos'
import SelectorProyecto from '@/components/proyectos/SelectorProyecto'
import ArrastreMes from '@/components/movimientos/ArrastreMes'
import BuscadorConLista from '@/components/movimientos/BuscadorConLista'
import LupaBoton from '@/components/movimientos/LupaBoton'
import { mesAnterior } from '@/lib/utils-fecha'

function fmt(n: number) {
  return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default async function ProyectoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ mes?: string; cat?: string; q?: string }>
}) {
  const { id } = await params
  const { mes, cat, q } = await searchParams

  const esBusqueda = q !== undefined

  const supabase = await createClient()

  // Pre-compute all date values before any query
  const hoy = new Date()
  const mesAno = mes ?? `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
  const [year, month] = mesAno.split('-').map(Number)
  const primerDia = `${mesAno}-01`
  const ultimoDia = new Date(year, month, 0).toISOString().split('T')[0]
  const mesLabel = new Date(year, month - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  const mesAnoAnterior = mesAnterior(mesAno)
  const [yearAnt, monthAnt] = mesAnoAnterior.split('-').map(Number)
  const mesLabelAnterior = new Date(yearAnt, monthAnt - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  // Build movements query: all months when searching, current month when not
  let movimientosQ = supabase.from('movimientos')
    .select('id, tipo, cantidad, fecha, created_at, descripcion, es_fijo, gasto_fijo_id, categorias(id, nombre, icono, color), perfiles(nombre, email), gastos_fijos!gasto_fijo_id(dia_del_mes)')
    .eq('proyecto_id', id)
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false })

  if (!esBusqueda) {
    movimientosQ = movimientosQ.gte('fecha', primerDia).lte('fecha', ultimoDia) as typeof movimientosQ
  }

  // Batch 1: auth + parallel queries
  const [
    user,
    { data: proyecto },
    { data: todosLosProyectos },
    { data: movimientos },
    { data: categorias },
    { data: gastosFijos },
    { data: arrastreActual },
    { data: presupuestosRaw },
  ] = await Promise.all([
    getCachedUser(),
    supabase.from('proyectos').select('id, nombre, tipo').eq('id', id).single(),
    supabase.from('proyectos').select('id, nombre, tipo').order('nombre'),
    movimientosQ,
    supabase.from('categorias').select('id, nombre, icono, color, tipo').eq('proyecto_id', id).order('nombre'),
    supabase.from('gastos_fijos').select('id').eq('proyecto_id', id).eq('activo', true),
    supabase.from('arrastres_mes').select('id, importe, estado').eq('proyecto_id', id).eq('mes_ano', mesAno).maybeSingle(),
    supabase.from('presupuestos').select('categoria_id, limite').eq('proyecto_id', id).eq('activo', true).or(`es_fijo.eq.true,mes_ano.eq.${mesAno}`),
  ])

  if (!user) redirect('/login')
  if (!proyecto) redirect('/mis-proyectos')

  // Month-specific logic: skip entirely when searching
  let pendientes = null
  let arrastrePendiente: { id: string; importe: number } | null = null
  let arrastreConfirmadoImporte = 0
  let miniDonutData: { nombre: string; icono: string; color: string; catId: string; total: number; porcentaje: number }[] = []
  let alertaIngresos = false
  let pctIngresosGastado = 0
  let alertasPresupuesto: { cat: { id: string; nombre: string; icono: string; color: string }; gastado: number; limite: number; pct: number; excedido: boolean }[] = []
  let totalAhorro = 0
  let totalPresupuesto = 0
  let gastoPresupuestado = 0

  if (!esBusqueda) {
    // Pendientes: upsert luego select (secuencial, dependen del upsert)
    if (gastosFijos && gastosFijos.length > 0) {
      await supabase
        .from('pendientes_confirmar')
        .upsert(
          gastosFijos.map(gf => ({
            proyecto_id: id,
            gasto_fijo_id: gf.id,
            mes_ano: mesAno,
            estado: 'pendiente',
          })),
          { onConflict: 'gasto_fijo_id,mes_ano', ignoreDuplicates: true }
        )
    }

    const { data: pendientesData } = await supabase
      .from('pendientes_confirmar')
      .select('id, gasto_fijo_id, gastos_fijos(nombre, cantidad, tipo, dia_del_mes, categorias(nombre, icono, color))')
      .eq('proyecto_id', id)
      .eq('mes_ano', mesAno)
      .eq('estado', 'pendiente')
      .order('created_at')

    pendientes = pendientesData

    // Arrastre: sub-queries paralelas cuando es necesario recalcular
    if (arrastreActual?.estado === 'confirmado') {
      arrastreConfirmadoImporte = Number(arrastreActual.importe)
    } else if (arrastreActual?.estado !== 'descartado') {
      const primerDiaAnt = `${mesAnoAnterior}-01`
      const ultimoDiaAnt = new Date(yearAnt, monthAnt, 0).toISOString().split('T')[0]

      const [{ data: arrastreMesAnterior }, { data: movsAnt }] = await Promise.all([
        supabase.from('arrastres_mes').select('importe, estado').eq('proyecto_id', id).eq('mes_ano', mesAnoAnterior).maybeSingle(),
        supabase.from('movimientos').select('tipo, cantidad').eq('proyecto_id', id).gte('fecha', primerDiaAnt).lte('fecha', ultimoDiaAnt),
      ])

      const arrastreConfirmadoAnterior = arrastreMesAnterior?.estado === 'confirmado'
        ? Number(arrastreMesAnterior.importe) : 0
      const ingresosAnt = (movsAnt ?? []).filter(m => m.tipo === 'ingreso').reduce((s, m) => s + Number(m.cantidad), 0)
      const gastosAnt = (movsAnt ?? []).filter(m => m.tipo === 'gasto').reduce((s, m) => s + Number(m.cantidad), 0)
      const saldoAnterior = arrastreConfirmadoAnterior + ingresosAnt - gastosAnt

      if (Math.abs(saldoAnterior) >= 0.005) {
        if (arrastreActual?.estado === 'pendiente') {
          await supabase.from('arrastres_mes').update({ importe: saldoAnterior }).eq('id', arrastreActual.id)
          arrastrePendiente = { id: arrastreActual.id, importe: saldoAnterior }
        } else {
          const { data: nuevo } = await supabase
            .from('arrastres_mes')
            .insert({ proyecto_id: id, mes_ano: mesAno, importe: saldoAnterior, estado: 'pendiente' })
            .select('id, importe')
            .single()
          if (nuevo) arrastrePendiente = { id: nuevo.id, importe: Number(nuevo.importe) }
        }
      }
    }

    // Mini donut data
    const totalesCat = new Map<string, { nombre: string; icono: string; color: string; catId: string; total: number }>()
    for (const m of movimientos ?? []) {
      if (m.tipo !== 'gasto') continue
      const cat2 = m.categorias as any
      if (!cat2) continue
      const key = cat2.nombre
      const prev = totalesCat.get(key) ?? { nombre: cat2.nombre, icono: cat2.icono, color: cat2.color, catId: key, total: 0 }
      prev.total += Number(m.cantidad)
      totalesCat.set(key, prev)
    }
    const totalGastosMes = [...totalesCat.values()].reduce((s, c) => s + c.total, 0)
    miniDonutData = [...totalesCat.values()]
      .sort((a, b) => b.total - a.total)
      .map(c => ({ ...c, porcentaje: totalGastosMes > 0 ? (c.total / totalGastosMes) * 100 : 0 }))

    // Alerta de ingresos: cuando gastos >= 80% del ingreso del mes
    const totalIngresos = (movimientos ?? [])
      .filter(m => m.tipo === 'ingreso')
      .reduce((s, m) => s + Number(m.cantidad), 0)
    pctIngresosGastado = totalIngresos > 0 ? (totalGastosMes / totalIngresos) * 100 : 0
    alertaIngresos = totalIngresos > 0 && pctIngresosGastado >= 80

    // Alertas de presupuesto por categoría
    const gastadoPorCatId: Record<string, number> = {}
    for (const m of movimientos ?? []) {
      if (m.tipo !== 'gasto') continue
      const cat = m.categorias as any
      if (!cat?.id) continue
      gastadoPorCatId[cat.id] = (gastadoPorCatId[cat.id] ?? 0) + Number(m.cantidad)
    }
    alertasPresupuesto = (presupuestosRaw ?? []).flatMap(p => {
      const cat = categorias?.find(c => c.id === p.categoria_id)
      if (!cat || Number(p.limite) <= 0) return []
      const gastado = gastadoPorCatId[p.categoria_id] ?? 0
      const pct = (gastado / Number(p.limite)) * 100
      if (pct < 80) return []
      return [{ cat, gastado, limite: Number(p.limite), pct, excedido: pct >= 100 }]
    }).sort((a, b) => b.pct - a.pct)

    totalAhorro = miniDonutData.find(c =>
      c.nombre.toLowerCase() === 'ahorro'
    )?.total ?? 0
    totalPresupuesto = (presupuestosRaw ?? []).reduce(
      (s, p) => s + Number(p.limite), 0
    )
    gastoPresupuestado = (presupuestosRaw ?? []).reduce((s, p) => {
      const gastado = gastadoPorCatId[p.categoria_id] ?? 0
      return s + Math.min(gastado, Number(p.limite))
    }, 0)
  }

  // Saldo acumulado por movimiento (extracto bancario)
  const inicioSaldo = esBusqueda ? 0 : arrastreConfirmadoImporte
  const saldoPorId: Record<string, number> = {}
  let acumulado = inicioSaldo
  for (const m of [...(movimientos ?? [])].reverse()) {
    acumulado += m.tipo === 'ingreso' ? Number(m.cantidad) : -Number(m.cantidad)
    saldoPorId[m.id] = acumulado
  }

  return (
    <div className="min-h-screen bg-[#FFF8EC]">
      <div className="bg-[#222222] px-4 pt-6 pb-6">
        <div className="max-w-sm mx-auto space-y-4">
          {/* Fila superior: nav + acciones */}
          <div className="flex items-center gap-3">
            <Link href="/mis-proyectos" className="text-[#FFE9CE]/60 hover:text-[#FFE9CE] transition-colors flex-shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Suspense fallback={
              <div>
                <p className="text-[#FFE9CE] font-black text-base leading-tight">{proyecto.nombre}</p>
                <p className="text-[#FFE9CE]/50 text-xs capitalize font-bold">{proyecto.tipo}</p>
              </div>
            }>
              <SelectorProyecto
                actual={proyecto}
                todos={todosLosProyectos ?? []}
              />
            </Suspense>
            <Link
              href={`/proyectos/${id}/estadisticas?mes=${mesAno}`}
              className="flex-shrink-0 text-[#FFE9CE]/60 hover:text-[#FFE9CE] transition-colors p-1 rounded-xl"
            >
              <BarChart3 className="w-5 h-5" />
            </Link>
            <LupaBoton proyectoId={id} />
          </div>

          {/* Balance total */}
          <div>
            <p className="text-[#FFE9CE]/50 text-[10px] font-black uppercase tracking-widest mb-1">
              Balance total · {mesLabel}
            </p>
            <p className={`text-4xl font-black tracking-tight ${
              (arrastreConfirmadoImporte +
                (movimientos ?? []).filter(m => m.tipo === 'ingreso').reduce((s,m) => s + Number(m.cantidad), 0) -
                (movimientos ?? []).filter(m => m.tipo === 'gasto').reduce((s,m) => s + Number(m.cantidad), 0)
              ) >= 0 ? 'text-[#FFF8EC]' : 'text-[#FD4C38]'
            }`}>
              {(() => {
                const ingresos = (movimientos ?? []).filter(m => m.tipo === 'ingreso').reduce((s,m) => s + Number(m.cantidad), 0)
                const gastos = (movimientos ?? []).filter(m => m.tipo === 'gasto').reduce((s,m) => s + Number(m.cantidad), 0)
                const saldo = arrastreConfirmadoImporte + ingresos - gastos
                return `${saldo >= 0 ? '+' : '−'}${Math.abs(saldo).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
              })()}
            </p>
          </div>

          {/* Píldoras ingresos/gastos */}
          <div className="flex gap-2">
            {(() => {
              const ingresos = (movimientos ?? []).filter(m => m.tipo === 'ingreso').reduce((s,m) => s + Number(m.cantidad), 0)
              const gastos = (movimientos ?? []).filter(m => m.tipo === 'gasto').reduce((s,m) => s + Number(m.cantidad), 0)
              return (
                <>
                  <div className="flex items-center gap-1.5 bg-white/8 border border-white/15 rounded-full px-3 py-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#2FA84F] border border-[#222222] flex-shrink-0" />
                    <span className="text-[#FFF8EC] text-xs font-black">
                      +{ingresos.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/8 border border-white/15 rounded-full px-3 py-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FD4C38] border border-[#222222] flex-shrink-0" />
                    <span className="text-[#FFF8EC] text-xs font-black">
                      −{gastos.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </span>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      </div>
      <div className="max-w-sm mx-auto px-4 py-6 pb-24 space-y-6">

        {esBusqueda ? (
          // Modo búsqueda: solo buscador + resultados
          <BuscadorConLista
            movimientos={(movimientos ?? []) as any}
            categorias={categorias ?? []}
            mesAno={mesAno}
            proyectoId={id}
            saldoPorId={saldoPorId}
          />
        ) : (
          // Modo normal: vista completa con widgets de mes
          <>

            {/* Alertas de presupuesto e ingresos */}
            {(alertaIngresos || alertasPresupuesto.length > 0) && (
              <div className="space-y-2">
                {alertaIngresos && (
                  <div className="rounded-2xl p-4 border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
                    <span className="text-lg leading-none mt-0.5">⚠️</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Ingresos del mes</p>
                      <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                        Has gastado el {Math.round(pctIngresosGastado)}% de tus ingresos este mes
                      </p>
                    </div>
                  </div>
                )}
                {alertasPresupuesto.map(a => (
                  <div
                    key={a.cat.id}
                    className={`rounded-2xl p-4 border flex items-start gap-3 ${
                      a.excedido
                        ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/60'
                        : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'
                    }`}
                  >
                    <span className="text-lg leading-none mt-0.5">{a.excedido ? '🚨' : '⚠️'}</span>
                    <div className="flex-1 min-w-0">
                      {a.excedido ? (
                        <>
                          <p className="text-sm font-semibold text-red-700 dark:text-red-400">{a.cat.nombre}</p>
                          <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">
                            Superado en +{fmt(a.gastado - a.limite)} €
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">{a.cat.nombre}</p>
                          <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                            Llevas el {Math.round(a.pct)}% ({fmt(a.gastado)} de {fmt(a.limite)} €)
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Resumen del mes */}
            <div className="flex items-center gap-2">
              <span className="text-[#FFD80B] text-lg">◆</span>
              <p className="text-[#222222] text-xs font-black uppercase tracking-widest">Resumen</p>
            </div>
            <ResumenMes
              movimientos={movimientos ?? []}
              arrastreConfirmado={arrastreConfirmadoImporte}
              mesLabelAnterior={mesLabelAnterior}
              totalPresupuesto={totalPresupuesto}
              gastoPresupuestado={gastoPresupuestado}
              totalAhorro={totalAhorro}
            />
            <div className="flex items-center gap-2">
              <span className="text-[#FFD80B] text-lg">◆</span>
              <p className="text-[#222222] text-xs font-black uppercase tracking-widest">Últimos movimientos</p>
            </div>


            {/* Arrastre del mes anterior */}
            {arrastrePendiente && (
              <ArrastreMes
                arrastre={arrastrePendiente}
                mesLabelAnterior={mesLabelAnterior}
              />
            )}

            {/* Pendientes de confirmar */}
            {pendientes && pendientes.length > 0 && (
              <PendientesConfirmar
                pendientes={pendientes as any}
                proyectoId={id}
                mesLabel={mesLabel}
              />
            )}

            {/* Formulario nuevo movimiento */}
            <NuevoMovimientoForm
              proyectoId={id}
              categorias={categorias ?? []}
              mesAno={mesAno}
            />

            {/* Lista agrupada por día con selector de mes y filtros */}
            <ListaMovimientos
              movimientos={(movimientos ?? []) as any}
              categorias={categorias ?? []}
              mesAno={mesAno}
              proyectoId={id}
              initialCat={cat}
              saldoPorId={saldoPorId}
            />
          </>
        )}

      </div>
    </div>
  )
}
