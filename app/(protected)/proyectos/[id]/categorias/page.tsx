export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import DonutCarousel from '@/components/categorias/DonutCarousel'
import ListaCategorias from '@/components/categorias/ListaCategorias'

export default async function CategoriasPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ mes?: string }>
}) {
  const { id } = await params
  const { mes } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: proyecto } = await supabase
    .from('proyectos')
    .select('id, nombre, tipo')
    .eq('id', id)
    .single()
  if (!proyecto) redirect('/mis-proyectos')

  const hoy = new Date()
  const mesAno = mes ?? `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
  const [year, month] = mesAno.split('-').map(Number)
  const primerDia = `${mesAno}-01`
  const ultimoDia = new Date(year, month, 0).toISOString().split('T')[0]
  const mesLabel = new Date(year, month - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  const { data: categorias } = await supabase
    .from('categorias')
    .select('id, nombre, icono, color')
    .eq('proyecto_id', id)
    .eq('tipo', 'gasto')
    .order('nombre')

  // Todos los movimientos del mes (gastos e ingresos) en una sola query
  const { data: movimientos } = await supabase
    .from('movimientos')
    .select('tipo, cantidad, categorias(id, nombre)')
    .eq('proyecto_id', id)
    .gte('fecha', primerDia)
    .lte('fecha', ultimoDia)

  const movimientosGasto = movimientos?.filter(m => m.tipo === 'gasto') ?? []
  const totalIngresos = movimientos
    ?.filter(m => m.tipo === 'ingreso')
    .reduce((s, m) => s + Number(m.cantidad), 0) ?? 0

  const totalesPorCat = new Map<string, number>()
  for (const m of movimientosGasto) {
    const cat = m.categorias as any
    if (!cat?.id) continue
    totalesPorCat.set(cat.id, (totalesPorCat.get(cat.id) ?? 0) + Number(m.cantidad))
  }
  const totalGastos = [...totalesPorCat.values()].reduce((s, v) => s + v, 0)

  const categoriaStats = (categorias ?? [])
    .map(cat => {
      const total = totalesPorCat.get(cat.id) ?? 0
      const porcentaje = totalGastos > 0 ? (total / totalGastos) * 100 : 0
      return { catId: cat.id, nombre: cat.nombre, icono: cat.icono, color: cat.color, total, porcentaje }
    })
    .sort((a, b) => b.total - a.total)

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
            <p className="text-neutral-500 text-xs">Categorías</p>
          </div>
        </div>

        {/* Selector de mes */}
        <div className="flex items-center justify-between">
          <Link
            href={`/proyectos/${id}/categorias?mes=${prevMes}`}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span className="text-neutral-900 dark:text-white font-medium capitalize text-sm">{mesLabel}</span>
          <Link
            href={`/proyectos/${id}/categorias?mes=${nextMes}`}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Carrusel de donuts */}
        <DonutCarousel
          categorias={categoriaStats}
          totalGastos={totalGastos}
          totalIngresos={totalIngresos}
        />

        {/* Lista de categorías */}
        <div className="space-y-2">
          <h2 className="text-neutral-500 dark:text-neutral-400 text-xs font-medium uppercase tracking-wider">
            Detalle por categoría
          </h2>
          <ListaCategorias
            categorias={categoriaStats}
            proyectoId={id}
            mesAno={mesAno}
          />
        </div>

      </div>
    </div>
  )
}
