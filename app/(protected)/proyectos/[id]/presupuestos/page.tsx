export const dynamic = 'force-dynamic'

import { createClient, getCachedUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import ListaPresupuestos from '@/components/categorias/ListaPresupuestos'

export default async function PresupuestosPage({
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
  const mesAno = mes ?? `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
  const [year, month] = mesAno.split('-').map(Number)
  const primerDia = `${mesAno}-01`
  const ultimoDia = new Date(year, month, 0).toISOString().split('T')[0]
  const mesLabel = new Date(year, month - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  const [
    user,
    { data: proyecto },
    { data: categorias },
    { data: movimientos },
    { data: presupuestosRaw },
  ] = await Promise.all([
    getCachedUser(),
    supabase.from('proyectos').select('id, nombre').eq('id', id).single(),
    supabase.from('categorias').select('id, nombre, icono, color').eq('proyecto_id', id).eq('tipo', 'gasto').order('nombre'),
    supabase.from('movimientos').select('tipo, cantidad, categorias(id)').eq('proyecto_id', id).eq('tipo', 'gasto').gte('fecha', primerDia).lte('fecha', ultimoDia),
    supabase.from('presupuestos').select('id, categoria_id, limite, es_fijo, mes_ano').eq('proyecto_id', id).eq('activo', true).or(`es_fijo.eq.true,mes_ano.eq.${mesAno}`),
  ])

  if (!user) redirect('/login')
  if (!proyecto) redirect('/mis-proyectos')

  const gastadoPorCat: { [catId: string]: number } = {}
  for (const m of movimientos ?? []) {
    const cat = m.categorias as any
    if (!cat?.id) continue
    gastadoPorCat[cat.id] = (gastadoPorCat[cat.id] ?? 0) + Number(m.cantidad)
  }

  const presupuestos = (presupuestosRaw ?? []).map(p => ({
    id: p.id as string,
    categoriaId: p.categoria_id as string,
    limite: Number(p.limite),
    esFijo: p.es_fijo as boolean,
    mesAno: p.mes_ano as string | null,
  }))

  const alertas = presupuestos.flatMap(p => {
    const cat = categorias?.find(c => c.id === p.categoriaId)
    if (!cat || p.limite <= 0) return []
    const gastado = gastadoPorCat[p.categoriaId] ?? 0
    const pct = (gastado / p.limite) * 100
    if (pct < 80) return []
    return [{ cat, gastado, limite: p.limite, pct, excedido: pct >= 100 }]
  }).sort((a, b) => b.pct - a.pct)

  function fmt(n: number) {
    return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const prevMes = month === 1 ? `${year - 1}-12` : `${year}-${String(month - 1).padStart(2, '0')}`
  const nextMes = month === 12 ? `${year + 1}-01` : `${year}-${String(month + 1).padStart(2, '0')}`

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="max-w-sm mx-auto px-4 py-6 pb-24 space-y-6">

        {/* Cabecera */}
        <div className="flex items-center gap-3">
          <Link
            href="/mis-proyectos"
            className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-neutral-900 dark:text-white">{proyecto.nombre}</h1>
            <p className="text-neutral-500 text-xs">Presupuestos</p>
          </div>
        </div>

        {/* Selector de mes */}
        <div className="flex items-center justify-between">
          <Link
            href={`/proyectos/${id}/presupuestos?mes=${prevMes}`}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span className="text-neutral-900 dark:text-white font-medium capitalize text-sm">{mesLabel}</span>
          <Link
            href={`/proyectos/${id}/presupuestos?mes=${nextMes}`}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        {alertas.length > 0 && (
          <div className="space-y-2">
            {alertas.map(a => (
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

        <ListaPresupuestos
          categorias={categorias ?? []}
          presupuestos={presupuestos}
          gastadoPorCat={gastadoPorCat}
          proyectoId={id}
          mesAno={mesAno}
        />

      </div>
    </div>
  )
}
