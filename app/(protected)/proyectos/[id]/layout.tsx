import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import BottomNavServer from '@/components/nav/BottomNavServer'
import NuevoMovimientoGlobal from '@/components/movimientos/NuevoMovimientoGlobal'

async function NuevoMovimientoGlobalServer({ proyectoId }: { proyectoId: string }) {
  const supabase = await createClient()
  const { data: categorias } = await supabase
    .from('categorias')
    .select('id, nombre, icono, color, tipo')
    .eq('proyecto_id', proyectoId)
    .order('nombre')
  return (
    <NuevoMovimientoGlobal
      proyectoId={proyectoId}
      categorias={categorias ?? []}
    />
  )
}

export default async function ProyectoLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <>
      {children}
      <Suspense fallback={null}>
        <BottomNavServer proyectoId={id} />
      </Suspense>
      <Suspense fallback={null}>
        <NuevoMovimientoGlobalServer proyectoId={id} />
      </Suspense>
    </>
  )
}
