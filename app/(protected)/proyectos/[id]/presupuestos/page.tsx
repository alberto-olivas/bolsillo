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
    { data: movimientosGasto },
    { data: presupuestosRaw },
    { data: movimientos },
  ] = await Promise.all([
    getCachedUser(),
    supabase.from('proyectos').select('id, nombre').eq('id', id).single(),
    supabase.from('categorias').select('id, nombre, icono, color').eq('proyecto_id', id).eq('tipo', 'gasto').order('nombre'),
    supabase.from('movimientos').select('tipo, cantidad, categorias(id)').eq('proyecto_id', id).eq('tipo', 'gasto').gte('fecha', primerDia).lte('fecha', ultimoDia),
    supabase.from('presupuestos').select('id, categoria_id, limite, es_fijo, mes_ano').eq('proyecto_id', id).eq('activo', true).or(`es_fijo.eq.true,mes_ano.eq.${mesAno}`),
    supabase.from('movimientos').select('tipo, cantidad').eq('proyecto_id', id).gte('fecha', primerDia).lte('fecha', ultimoDia),
  ])

  if (!user) redirect('/login')
  if (!proyecto) redirect('/mis-proyectos')

  const gastadoPorCat: { [catId: string]: number } = {}
  for (const m of movimientosGasto ?? []) {
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
    <div className="min-h-screen bg-[#FFF8EC]">
      <div className="bg-[#8B53FF] px-4 pt-6 pb-8 relative overflow-hidden">
        <div className="max-w-sm mx-auto space-y-3">
          <div className="flex items-center gap-3">
            <Link href="/mis-proyectos" className="text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-black text-[#FFD80B]">Presupuestos</h1>
            <div className="ml-auto">
              <span className="bg-[#FFD80B] text-[#222222] text-xs font-black px-3 py-1.5 rounded-full border-2 border-[#222222]">
                {mesLabel}
              </span>
            </div>
          </div>
          <div>
            <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-1">Disponible este mes</p>
            <p className="text-white text-4xl font-black tracking-tight">
              {(() => {
                const totalIngresos = (movimientos ?? []).filter(m => m.tipo === 'ingreso').reduce((s, m) => s + Number(m.cantidad), 0)
                const totalGastos = (movimientos ?? []).filter(m => m.tipo === 'gasto').reduce((s, m) => s + Number(m.cantidad), 0)
                const disponible = totalIngresos - totalGastos
                return `€${Math.abs(disponible).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              })()}
            </p>
          </div>
        </div>
        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-6xl opacity-10 pointer-events-none select-none">💰</span>
      </div>
      <div className="max-w-sm mx-auto px-4 py-6 pb-24 space-y-4">

        {/* Selector de mes */}
        <div className="flex items-center justify-between">
          <Link
            href={`/proyectos/${id}/presupuestos?mes=${prevMes}`}
            className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-[#222222] bg-[#FFE9CE] hover:bg-[#FBDDB2] text-[#222222] transition-colors"
            style={{ boxShadow: '2px 2px 0px 0px #222222' }}
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span className="text-[#222222] font-black capitalize text-sm">{mesLabel}</span>
          <Link
            href={`/proyectos/${id}/presupuestos?mes=${nextMes}`}
            className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-[#222222] bg-[#FFE9CE] hover:bg-[#FBDDB2] text-[#222222] transition-colors"
            style={{ boxShadow: '2px 2px 0px 0px #222222' }}
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#FFD80B] text-lg">◆</span>
          <p className="text-[#222222] text-xs font-black uppercase tracking-widest">Progreso por categoría</p>
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
