import { Suspense } from 'react'
import BottomNav from '@/components/nav/BottomNav'

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
        <BottomNav proyectoId={id} />
      </Suspense>
    </>
  )
}
