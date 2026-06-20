'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { LayoutList, ChartPie, Wallet, Settings } from 'lucide-react'

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
    match: (p) => !p.includes('/categorias') && !p.includes('/presupuestos') && !p.startsWith('/ajustes'),
  },
  {
    href: (id, mes) => `/proyectos/${id}/categorias${mes}`,
    icon: ChartPie,
    label: 'Categorías',
    match: (p) => p.includes('/categorias'),
  },
  {
    href: (id, mes) => `/proyectos/${id}/presupuestos${mes}`,
    icon: Wallet,
    label: 'Presupuestos',
    match: (p) => p.includes('/presupuestos'),
  },
]

export default function BottomNav({ proyectoId }: { proyectoId: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const mes = searchParams.get('mes')
  const mesParam = mes ? `?mes=${mes}` : ''

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-50 max-w-sm mx-auto bg-white dark:bg-[#1c1c1e] border border-neutral-200/80 dark:border-white/10 rounded-3xl shadow-lg dark:shadow-black/40 overflow-hidden">
      <div className="flex items-center justify-around py-2">
        {NAV_ITEMS.map(item => {
          const activo = item.match(pathname)
          const Icono = item.icon
          return (
            <Link
              key={item.label}
              href={item.href(proyectoId, mesParam)}
              className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors ${
                activo ? 'text-indigo-500' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              <Icono className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
        <Link
          href={`/ajustes?proyecto=${proyectoId}`}
          className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors ${
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
