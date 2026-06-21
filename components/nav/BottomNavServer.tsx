import { createClient } from '@/lib/supabase/server'
import BottomNav from './BottomNav'

export default async function BottomNavServer({ proyectoId }: { proyectoId: string }) {
  const supabase = await createClient()

  const hoy = new Date()
  const mesAno = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
  const primerDia = `${mesAno}-01`
  const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0]

  const [{ data: presupuestos }, { data: movimientos }] = await Promise.all([
    supabase.from('presupuestos')
      .select('categoria_id, limite')
      .eq('proyecto_id', proyectoId)
      .eq('activo', true)
      .or(`es_fijo.eq.true,mes_ano.eq.${mesAno}`),
    supabase.from('movimientos')
      .select('cantidad, categoria_id')
      .eq('proyecto_id', proyectoId)
      .eq('tipo', 'gasto')
      .gte('fecha', primerDia)
      .lte('fecha', ultimoDia),
  ])

  const gastadoPorCat: Record<string, number> = {}
  for (const m of movimientos ?? []) {
    if (!m.categoria_id) continue
    gastadoPorCat[m.categoria_id] = (gastadoPorCat[m.categoria_id] ?? 0) + Number(m.cantidad)
  }

  let tieneAlertas = false
  let tieneExcedidos = false
  for (const p of presupuestos ?? []) {
    if (p.limite <= 0) continue
    const pct = ((gastadoPorCat[p.categoria_id] ?? 0) / p.limite) * 100
    if (pct >= 100) { tieneExcedidos = true; tieneAlertas = true; break }
    if (pct >= 80) tieneAlertas = true
  }

  return (
    <BottomNav
      proyectoId={proyectoId}
      tieneAlertas={tieneAlertas}
      tieneExcedidos={tieneExcedidos}
    />
  )
}
