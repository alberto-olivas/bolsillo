export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import NuevoMovimientoForm from '@/components/movimientos/NuevoMovimientoForm'
import MovimientoItem from '@/components/movimientos/MovimientoItem'
import ResumenMes from '@/components/movimientos/ResumenMes'

export default async function ProyectoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

  // Movimientos del mes actual
  const hoy = new Date()
  const primerDia = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`

  const { data: movimientos } = await supabase
    .from('movimientos')
    .select('id, tipo, cantidad, fecha, descripcion, es_fijo, gasto_fijo_id, categorias(nombre, icono, color), perfiles(nombre, email), gastos_fijos!gasto_fijo_id(dia_del_mes)')
    .eq('proyecto_id', id)
    .gte('fecha', primerDia)
    .order('fecha', { ascending: false })

  // Categorías del proyecto para el formulario
  const { data: categorias } = await supabase
    .from('categorias')
    .select('id, nombre, icono, color, tipo')
    .eq('proyecto_id', id)
    .order('nombre')

  const mesLabel = hoy.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

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
        <div className="space-y-2">
          <h2 className="text-neutral-400 text-xs font-medium uppercase tracking-wider capitalize">
            {mesLabel}
          </h2>
          <ResumenMes movimientos={movimientos ?? []} />
        </div>

        {/* Formulario nuevo movimiento */}
        <NuevoMovimientoForm
          proyectoId={id}
          categorias={categorias ?? []}
        />

        {/* Lista de movimientos */}
        <div className="space-y-2">
          <h2 className="text-neutral-400 text-xs font-medium uppercase tracking-wider">
            Movimientos
          </h2>
          {movimientos && movimientos.length > 0 ? (
            <div className="bg-neutral-900 rounded-2xl px-5 border border-neutral-800">
              {movimientos.map(m => (
                <MovimientoItem
                  key={m.id}
                  id={m.id}
                  tipo={m.tipo as 'gasto' | 'ingreso'}
                  cantidad={m.cantidad}
                  fecha={m.fecha}
                  descripcion={m.descripcion}
                  categoria={m.categorias as any}
                  usuario={m.perfiles as any}
                  categorias={categorias ?? []}
                  esFijo={m.es_fijo ?? false}
                  gastoFijoId={m.gasto_fijo_id ?? null}
                  diaDelMes={(m.gastos_fijos as any)?.dia_del_mes ?? null}
                />
              ))}
            </div>
          ) : (
            <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800 text-center">
              <p className="text-neutral-500 text-sm">Sin movimientos este mes.</p>
              <p className="text-neutral-600 text-xs mt-1">Añade tu primer gasto o ingreso.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
