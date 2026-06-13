'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { LayoutList, ChartPie, Settings } from 'lucide-react'

type NavItem = {
  href: (id: string, mesParam: string) => string
  icon: React.ComponentType<{ className?: string }>
  label: string
  match: (pathname: string) => boolean
}

const NAV_ITEMS: NavItem[] = [
  {
    href: (id, mes) => `/proyectos/${id}${mes}`,
    icon: LayoutList,
    label: 'Movimientos',
    match: (p) => !p.includes('/categorias'),
  },
  {
    href: (id, mes) => `/proyectos/${id}/categorias${mes}`,
    icon: ChartPie,
    label: 'Categorías',
    match: (p) => p.includes('/categorias'),
  },
]

export default function BottomNav({ proyectoId }: { proyectoId: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const mes = searchParams.get('mes')
  const mesParam = mes ? `?mes=${mes}` : ''

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
      <div className="max-w-sm mx-auto flex items-center justify-around py-2">
        {NAV_ITEMS.map(item => {
          const activo = item.match(pathname)
          const Icono = item.icon
          return (
            <Link
              key={item.label}
              href={item.href(proyectoId, mesParam)}
              className={`flex flex-col items-center gap-1 px-6 py-1 rounded-xl transition-colors ${
                activo ? 'text-indigo-500' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              <Icono className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
        <Link
          href="/ajustes"
          className={`flex flex-col items-center gap-1 px-6 py-1 rounded-xl transition-colors ${
            pathname === '/ajustes' ? 'text-indigo-500' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-xs font-medium">Ajustes</span>
        </Link>
      </div>
    </nav>
  )
}
