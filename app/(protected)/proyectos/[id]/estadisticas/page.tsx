export const dynamic = 'force-dynamic'

import { createClient, getCachedUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import GraficoBarras from '@/components/estadisticas/GraficoBarras'

function fmt(n: number) {
  return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default async function EstadisticasPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ mes?: string }>
}) {
  const { id } = await params
  const { mes } = await searchParams

  const supabase = await createClient()

  const hoy = new Date()
  const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
  const mesResaltado = mes ?? mesActual

  // Ventana de 6 meses: desde hace 5 meses hasta el mes actual
  const dInicio = new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1)
  const fechaInicio = `${dInicio.getFullYear()}-${String(dInicio.getMonth() + 1).padStart(2, '0')}-01`
  const fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0]

  const [
    user,
    { data: proyecto },
    { data: movimientos },
  ] = await Promise.all([
    getCachedUser(),
    supabase.from('proyectos').select('id, nombre').eq('id', id).single(),
    supabase.from('movimientos')
      .select('cantidad, fecha')
      .eq('proyecto_id', id)
      .eq('tipo', 'gasto')
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin)
      .order('fecha'),
  ])

  if (!user) redirect('/login')
  if (!proyecto) redirect('/mis-proyectos')

  // Agrupar por mes
  const totalesPorMes: Record<string, number> = {}
  for (const m of movimientos ?? []) {
    const mesKey = m.fecha.slice(0, 7)
    totalesPorMes[mesKey] = (totalesPorMes[mesKey] ?? 0) + Number(m.cantidad)
  }

  // Array de 6 meses (incluye meses sin gastos)
  const meses6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - 5 + i, 1)
    const mesKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const mesLabelRaw = d.toLocaleDateString('es-ES', { month: 'short' }).replace(/\./g, '')
    const mesLabel = mesLabelRaw.charAt(0).toUpperCase() + mesLabelRaw.slice(1)
    return { mesKey, mesLabel, total: totalesPorMes[mesKey] ?? 0 }
  })

  // Estadísticas de resumen
  const total6M = meses6.reduce((s, m) => s + m.total, 0)
  const mesesConGasto = meses6.filter(m => m.total > 0)
  const media = mesesConGasto.length > 0 ? total6M / mesesConGasto.length : 0
  const mesMaximo = meses6.reduce(
    (max, m) => m.total > max.total ? m : max,
    { mesKey: '', mesLabel: '', total: 0 }
  )

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="max-w-sm mx-auto px-4 py-6 pb-24 space-y-6">

        {/* Cabecera */}
        <div className="flex items-center gap-3">
          <Link
            href={`/proyectos/${id}?mes=${mesResaltado}`}
            className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-neutral-900 dark:text-white font-bold text-lg leading-tight truncate">
              {proyecto.nombre}
            </p>
            <p className="text-neutral-500 text-xs">Estadísticas · últimos 6 meses</p>
          </div>
        </div>

        {/* Chips de resumen */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl p-3 border border-neutral-200 dark:border-neutral-800">
            <p className="text-neutral-500 dark:text-neutral-400 text-xs">Media/mes</p>
            <p className="text-neutral-900 dark:text-white font-semibold text-sm mt-0.5 truncate">
              {fmt(media)} €
            </p>
          </div>
          <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl p-3 border border-neutral-200 dark:border-neutral-800">
            <p className="text-neutral-500 dark:text-neutral-400 text-xs">Mes más alto</p>
            <p className="text-neutral-900 dark:text-white font-semibold text-sm mt-0.5">
              {mesMaximo.total > 0 ? mesMaximo.mesLabel : '—'}
            </p>
            {mesMaximo.total > 0 && (
              <p className="text-neutral-500 dark:text-neutral-400 text-xs truncate">{fmt(mesMaximo.total)} €</p>
            )}
          </div>
          <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl p-3 border border-neutral-200 dark:border-neutral-800">
            <p className="text-neutral-500 dark:text-neutral-400 text-xs">Total 6M</p>
            <p className="text-neutral-900 dark:text-white font-semibold text-sm mt-0.5 truncate">
              {fmt(total6M)} €
            </p>
          </div>
        </div>

        {/* Gráfico de barras */}
        <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl px-4 pt-4 pb-2 border border-neutral-200 dark:border-neutral-800">
          <GraficoBarras
            datos={meses6}
            proyectoId={id}
            mesResaltado={mesResaltado}
          />
          {mesesConGasto.length > 0 && (
            <p className="text-center text-neutral-400 dark:text-neutral-600 text-xs pb-2">
              Toca una barra para ver ese mes
            </p>
          )}
        </div>

      </div>
    </div>
  )
}
