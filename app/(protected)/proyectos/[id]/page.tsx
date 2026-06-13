export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import NuevoMovimientoForm from '@/components/movimientos/NuevoMovimientoForm'
import ResumenMes from '@/components/movimientos/ResumenMes'
import PendientesConfirmar from '@/components/movimientos/PendientesConfirmar'
import ListaMovimientos from '@/components/movimientos/ListaMovimientos'

export default async function ProyectoPage({
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

  // RLS bloquea si el usuario no es miembro → redirige
  const { data: proyecto } = await supabase
    .from('proyectos')
    .select('id, nombre, tipo')
    .eq('id', id)
    .single()
  if (!proyecto) redirect('/mis-proyectos')

  // Calcular rango del mes (actual o el de searchParams)
  const hoy = new Date()
  const mesAno = mes ?? `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
  const [year, month] = mesAno.split('-').map(Number)
  const primerDia = `${mesAno}-01`
  const ultimoDia = new Date(year, month, 0).toISOString().split('T')[0]
  const mesLabel = new Date(year, month - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  // Movimientos del mes
  const { data: movimientos } = await supabase
    .from('movimientos')
    .select('id, tipo, cantidad, fecha, descripcion, es_fijo, gasto_fijo_id, categorias(nombre, icono, color), perfiles(nombre, email), gastos_fijos!gasto_fijo_id(dia_del_mes)')
    .eq('proyecto_id', id)
    .gte('fecha', primerDia)
    .lte('fecha', ultimoDia)
    .order('fecha', { ascending: false })

  // Categorías del proyecto para el formulario y filtros
  const { data: categorias } = await supabase
    .from('categorias')
    .select('id, nombre, icono, color, tipo')
    .eq('proyecto_id', id)
    .order('nombre')

  // Gastos fijos activos del proyecto
  const { data: gastosFijos } = await supabase
    .from('gastos_fijos')
    .select('id')
    .eq('proyecto_id', id)
    .eq('activo', true)

  // Generar pendientes del mes actual (idempotente — onConflict protege contra duplicados)
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

  // Pendientes del mes con datos del gasto fijo y categoría
  const { data: pendientes } = await supabase
    .from('pendientes_confirmar')
    .select('id, gasto_fijo_id, gastos_fijos(nombre, cantidad, tipo, dia_del_mes, categorias(nombre, icono, color))')
    .eq('proyecto_id', id)
    .eq('mes_ano', mesAno)
    .eq('estado', 'pendiente')
    .order('created_at')

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-sm mx-auto px-4 py-6 space-y-6">

        {/* Cabecera */}
        <div className="flex items-center gap-3">
          <Link href="/mis-proyectos" className="text-neutral-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white">{proyecto.nombre}</h1>
            <p className="text-neutral-500 text-xs capitalize">{proyecto.tipo}</p>
          </div>
        </div>

        {/* Resumen del mes */}
        <ResumenMes movimientos={movimientos ?? []} />

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
        />

      </div>
    </div>
  )
}
