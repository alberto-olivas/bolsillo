'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { LayoutList, ChartPie, Wallet, Settings } from 'lucide-react'
import { useState } from 'react'

export default function BottomNav({
  proyectoId,
  tieneAlertas,
  tieneExcedidos,
}: {
  proyectoId: string
  tieneAlertas?: boolean
  tieneExcedidos?: boolean
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const mes = searchParams.get('mes')
  const mesParam = mes ? `?mes=${mes}` : ''
  const [fabAbierto, setFabAbierto] = useState(false)

  const isMovimientos = !pathname.includes('/categorias') && !pathname.includes('/presupuestos') && !pathname.startsWith('/ajustes')
  const isCategorias = pathname.includes('/categorias')
  const isPresupuestos = pathname.includes('/presupuestos')
  const isAjustes = pathname === '/ajustes'

  return (
    <>
      {/* Overlay cuando FAB está abierto */}
      {fabAbierto && (
        <div
          className="fixed inset-0 z-40 bg-[#222222]/60"
          onClick={() => setFabAbierto(false)}
        />
      )}

      {/* Menú FAB expandido */}
      {fabAbierto && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
          <Link
            href={`/proyectos/${proyectoId}${mesParam}#nuevo`}
            onClick={() => setFabAbierto(false)}
            className="flex items-center gap-3 bg-[#FFF8EC] border-2 border-[#222222] rounded-2xl px-5 py-3 font-black text-[#222222] text-sm"
            style={{ boxShadow: '3px 3px 0px 0px #222222' }}
          >
            <span className="text-lg">💸</span>
            Nuevo gasto
          </Link>
          <Link
            href={`/proyectos/${proyectoId}${mesParam}#nuevo-ingreso`}
            onClick={() => setFabAbierto(false)}
            className="flex items-center gap-3 bg-[#E8F8E0] border-2 border-[#222222] rounded-2xl px-5 py-3 font-black text-[#222222] text-sm"
            style={{ boxShadow: '3px 3px 0px 0px #222222' }}
          >
            <span className="text-lg">💰</span>
            Nuevo ingreso
          </Link>
        </div>
      )}

      <nav className="fixed bottom-3 left-3 right-3 z-50 max-w-sm mx-auto bg-[#222222] border-2 border-[#222222] rounded-3xl overflow-visible" style={{ boxShadow: '4px 4px 0px 0px var(--shadow-main)' }}>
        <div className="flex items-center justify-around py-2 px-2">

          {/* Movimientos */}
          <Link
            href={`/proyectos/${proyectoId}${mesParam}`}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
              isMovimientos ? 'text-[#FFD80B] bg-[#FFD80B]/10' : 'text-[#FFE9CE]/40 hover:text-[#FFE9CE]/70'
            }`}
          >
            <LayoutList className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-wide">Gastos</span>
          </Link>

          {/* Categorías */}
          <Link
            href={`/proyectos/${proyectoId}/categorias${mesParam}`}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
              isCategorias ? 'text-[#FFD80B] bg-[#FFD80B]/10' : 'text-[#FFE9CE]/40 hover:text-[#FFE9CE]/70'
            }`}
          >
            <ChartPie className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-wide">Stats</span>
          </Link>

          {/* FAB central */}
          <button
            type="button"
            onClick={() => setFabAbierto(v => !v)}
            className="relative -mt-6 w-14 h-14 bg-[#FFD80B] border-2 border-[#FFF8EC] rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-95"
            style={{ boxShadow: '3px 3px 0px 0px #222222' }}
          >
            <span className={`text-[#222222] text-2xl font-black transition-transform duration-200 ${fabAbierto ? 'rotate-45' : 'rotate-0'}`}>+</span>
          </button>

          {/* Presupuestos */}
          <Link
            href={`/proyectos/${proyectoId}/presupuestos${mesParam}`}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors relative ${
              isPresupuestos ? 'text-[#FFD80B] bg-[#FFD80B]/10' : 'text-[#FFE9CE]/40 hover:text-[#FFE9CE]/70'
            }`}
          >
            <div className="relative">
              <Wallet className="w-5 h-5" />
              {(tieneAlertas || tieneExcedidos) && (
                <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#222222] ${
                  tieneExcedidos ? 'bg-[#FD4C38]' : 'bg-[#FFD80B]'
                }`} />
              )}
            </div>
            <span className="text-[9px] font-black uppercase tracking-wide">Presup.</span>
          </Link>

          {/* Ajustes */}
          <Link
            href={`/ajustes?proyecto=${proyectoId}`}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
              isAjustes ? 'text-[#FFD80B] bg-[#FFD80B]/10' : 'text-[#FFE9CE]/40 hover:text-[#FFE9CE]/70'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-wide">Ajustes</span>
          </Link>

        </div>
      </nav>
    </>
  )
}
