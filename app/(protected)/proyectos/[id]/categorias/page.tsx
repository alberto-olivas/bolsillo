export const dynamic = 'force-dynamic'

import { createClient, getCachedUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import DonutBalanceMes from '@/components/categorias/DonutBalanceMes'
import DonutCategorias from '@/components/categorias/DonutCategorias'
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
  ] = await Promise.all([
    getCachedUser(),
    supabase.from('proyectos').select('id, nombre, tipo').eq('id', id).single(),
    supabase.from('categorias').select('id, nombre, icono, color').eq('proyecto_id', id).eq('tipo', 'gasto').order('nombre'),
    supabase.from('movimientos').select('tipo, cantidad, categorias(id, nombre)').eq('proyecto_id', id).gte('fecha', primerDia).lte('fecha', ultimoDia),
  ])

  if (!user) redirect('/login')
  if (!proyecto) redirect('/mis-proyectos')

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

  const totalAhorroMes = categoriaStats.find(c =>
    c.nombre.toLowerCase() === 'ahorro'
  )?.total ?? 0

  return (
    <div className="min-h-screen bg-[#FFF8EC]">
      <div className="bg-[#222222] px-4 pt-6 pb-5">
        <div className="max-w-sm mx-auto space-y-3">
          <div className="flex items-center gap-3">
            <Link
              href="/mis-proyectos"
              className="text-[#FFE9CE]/60 hover:text-[#FFE9CE] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <h1 className="text-lg font-black text-[#FFE9CE]">{proyecto.nombre}</h1>
              <p className="text-[#FFE9CE]/50 text-xs font-bold">Categorías</p>
            </div>
          </div>
          {/* Selector de mes */}
          <div className="flex items-center justify-between">
            <Link
              href={`/proyectos/${id}/categorias?mes=${prevMes}`}
              className="w-7 h-7 flex items-center justify-center rounded-full border-2 border-[#FFE9CE]/30 text-[#FFE9CE]/60 hover:border-[#FFE9CE] hover:text-[#FFE9CE] transition-colors text-sm font-black"
            >
              ‹
            </Link>
            <span className="text-[#FFE9CE]/70 text-xs font-black uppercase tracking-widest capitalize">
              {mesLabel}
            </span>
            <Link
              href={`/proyectos/${id}/categorias?mes=${nextMes}`}
              className="w-7 h-7 flex items-center justify-center rounded-full border-2 border-[#FFE9CE]/30 text-[#FFE9CE]/60 hover:border-[#FFE9CE] hover:text-[#FFE9CE] transition-colors text-sm font-black"
            >
              ›
            </Link>
          </div>
        </div>
      </div>
      <div className="max-w-sm mx-auto px-4 py-6 pb-24 space-y-6">

        {/* Tabs de vista */}
        <div className="flex gap-0">
          <div className="flex-1 py-2.5 text-center text-[11px] font-black uppercase tracking-wide bg-[#222222] text-[#FFD80B] rounded-l-xl border-2 border-[#222222]">
            Categorías
          </div>
          <div className="flex-1 py-2.5 text-center text-[11px] font-black uppercase tracking-wide bg-[#FFE9CE] text-[#222222]/50 rounded-r-xl border-2 border-[#222222] border-l-0">
            Mensual
          </div>
        </div>

        {/* Donut ingresos vs gastos */}
        <DonutBalanceMes
          totalGastos={totalGastos}
          totalIngresos={totalIngresos}
          totalAhorro={totalAhorroMes}
        />

        {/* Título por categoría */}
        <div className="flex items-center gap-2">
          <span className="text-[#FFD80B] text-lg">◆</span>
          <p className="text-[#222222] text-xs font-black uppercase tracking-widest">Por categoría</p>
        </div>

        {/* Donut categorías */}
        <DonutCategorias
          categorias={categoriaStats}
          totalGastos={totalGastos}
        />

        {/* Grid de chips de categoría */}
        <div className="grid grid-cols-2 gap-2">
          {categoriaStats.filter(c => c.total > 0).map(cat => (
            <div
              key={cat.catId}
              className="bg-[#FFF8EC] rounded-2xl p-3 border-2 border-[#222222] flex items-center gap-2"
              style={{ boxShadow: '3px 3px 0px 0px #222222' }}
            >
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0 border-2 border-[#222222]"
                style={{ backgroundColor: cat.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-[#222222] truncate">{cat.nombre}</p>
                <div className="h-1.5 bg-[#222222]/10 rounded-full mt-1 border border-[#222222]/20 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${cat.porcentaje}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
              <p className="text-[11px] font-black text-[#222222] flex-shrink-0">{Math.round(cat.porcentaje)}%</p>
            </div>
          ))}
        </div>

        {/* Lista detalle */}
        <div className="space-y-2">
          <p className="text-[#222222]/50 text-[10px] font-black uppercase tracking-widest">Detalle</p>
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
