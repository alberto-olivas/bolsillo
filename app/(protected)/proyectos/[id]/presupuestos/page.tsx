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
    <div className="min-h-screen bg-[#FFF8EC]">
      <div className="bg-[#222222] px-4 pt-6 pb-5">
        <div className="max-w-sm mx-auto flex items-center gap-3">
          <Link
            href="/mis-proyectos"
            className="text-[#FFE9CE]/60 hover:text-[#FFE9CE] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-black text-[#FFE9CE]">{proyecto.nombre}</h1>
            <p className="text-[#FFE9CE]/50 text-xs font-bold">Presupuestos</p>
          </div>
        </div>
      </div>
      <div className="max-w-sm mx-auto px-4 py-6 pb-24 space-y-6">

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

        {alertas.length > 0 && (
          <div className="space-y-2">
            {alertas.map(a => (
              <div
                key={a.cat.id}
                className={`rounded-2xl p-4 border-2 flex items-start gap-3 ${
                  a.excedido
                    ? 'bg-[#FFE2DD] border-[#FD4C38]'
                    : 'bg-[#FFF8C7] border-[#222222]'
                }`}
                style={{ boxShadow: a.excedido ? '3px 3px 0px 0px #FD4C38' : '3px 3px 0px 0px #222222' }}
              >
                <span className="text-lg leading-none mt-0.5">{a.excedido ? '🚨' : '⚠️'}</span>
                <div className="flex-1 min-w-0">
                  {a.excedido ? (
                    <>
                      <p className="text-sm font-black text-[#FD4C38]">{a.cat.nombre}</p>
                      <p className="text-xs text-[#FD4C38]/70 mt-0.5 font-medium">
                        Superado en +{fmt(a.gastado - a.limite)} €
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-black text-[#222222]">{a.cat.nombre}</p>
                      <p className="text-xs text-[#222222]/60 mt-0.5 font-medium">
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
