import { Suspense } from 'react'
import BottomNavServer from '@/components/nav/BottomNavServer'

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
    </>
  )
}
