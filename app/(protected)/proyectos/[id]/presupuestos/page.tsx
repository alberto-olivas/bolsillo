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
