export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import NuevoMovimientoForm from '@/components/movimientos/NuevoMovimientoForm'
import ResumenMes from '@/components/movimientos/ResumenMes'
import PendientesConfirmar from '@/components/movimientos/PendientesConfirmar'
import ListaMovimientos from '@/components/movimientos/ListaMovimientos'
import DonutCategorias from '@/components/categorias/DonutCategorias'
import SelectorProyecto from '@/components/proyectos/SelectorProyecto'
import ArrastreMes from '@/components/movimientos/ArrastreMes'
import { mesAnterior } from '@/lib/utils-fecha'

export default async function ProyectoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ mes?: string; cat?: string }>
}) {
  const { id } = await params
  const { mes, cat } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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

  // Batch 1: 6 queries en paralelo (todas independientes entre sí)
  const [
    { data: proyecto },
    { data: todosLosProyectos },
    { data: movimientos },
    { data: categorias },
    { data: gastosFijos },
    { data: arrastreActual },
  ] = await Promise.all([
    supabase.from('proyectos').select('id, nombre, tipo').eq('id', id).single(),
    supabase.from('proyectos').select('id, nombre, tipo').order('nombre'),
    supabase.from('movimientos')
      .select('id, tipo, cantidad, fecha, descripcion, es_fijo, gasto_fijo_id, categorias(nombre, icono, color), perfiles(nombre, email), gastos_fijos!gasto_fijo_id(dia_del_mes)')
      .eq('proyecto_id', id).gte('fecha', primerDia).lte('fecha', ultimoDia).order('fecha', { ascending: false }),
    supabase.from('categorias').select('id, nombre, icono, color, tipo').eq('proyecto_id', id).order('nombre'),
    supabase.from('gastos_fijos').select('id').eq('proyecto_id', id).eq('activo', true),
    supabase.from('arrastres_mes').select('id, importe, estado').eq('proyecto_id', id).eq('mes_ano', mesAno).maybeSingle(),
  ])

  if (!proyecto) redirect('/mis-proyectos')

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

  const { data: pendientes } = await supabase
    .from('pendientes_confirmar')
    .select('id, gasto_fijo_id, gastos_fijos(nombre, cantidad, tipo, dia_del_mes, categorias(nombre, icono, color))')
    .eq('proyecto_id', id)
    .eq('mes_ano', mesAno)
    .eq('estado', 'pendiente')
    .order('created_at')

  // Arrastre: sub-queries paralelas cuando es necesario recalcular
  let arrastrePendiente: { id: string; importe: number } | null = null
  let arrastreConfirmadoImporte = 0

  if (arrastreActual?.estado === 'confirmado') {
    arrastreConfirmadoImporte = Number(arrastreActual.importe)
  } else if (arrastreActual?.estado !== 'descartado') {
    const primerDiaAnt = `${mesAnoAnterior}-01`
    const ultimoDiaAnt = new Date(yearAnt, monthAnt, 0).toISOString().split('T')[0]

    // Estas dos sub-queries son independientes entre sí
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
  const miniDonutData = [...totalesCat.values()]
    .sort((a, b) => b.total - a.total)
    .map(c => ({ ...c, porcentaje: totalGastosMes > 0 ? (c.total / totalGastosMes) * 100 : 0 }))

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="max-w-sm mx-auto px-4 py-6 pb-24 space-y-6">

        {/* Cabecera */}
        <div className="flex items-center gap-3">
          <Link href="/mis-proyectos" className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors flex-shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Suspense fallback={
            <div>
              <p className="text-neutral-900 dark:text-white font-bold text-lg leading-tight">{proyecto.nombre}</p>
              <p className="text-neutral-500 text-xs capitalize">{proyecto.tipo}</p>
            </div>
          }>
            <SelectorProyecto
              actual={proyecto}
              todos={todosLosProyectos ?? []}
            />
          </Suspense>
        </div>

        {/* Resumen del mes */}
        <ResumenMes
          movimientos={movimientos ?? []}
          arrastreConfirmado={arrastreConfirmadoImporte}
          mesLabelAnterior={mesLabelAnterior}
        />

        {/* Mini donut de categorías */}
        {miniDonutData.length > 0 && (
          <div className="flex flex-col items-center gap-2">
            <DonutCategorias
              categorias={miniDonutData}
              totalGastos={totalGastosMes}
              className="w-36 h-36"
            />
            <Link
              href={`/proyectos/${id}/categorias?mes=${mesAno}`}
              className="text-indigo-400 text-xs hover:text-indigo-300 transition-colors"
            >
              Ver todas las categorías →
            </Link>
          </div>
        )}

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
        />

      </div>
    </div>
  )
}
