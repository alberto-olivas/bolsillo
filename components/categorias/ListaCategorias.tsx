'use client'

import { useRouter } from 'next/navigation'
import { ICONOS } from '@/lib/iconos-categorias'
import { Package } from 'lucide-react'

type CategoriaStat = {
  catId: string
  nombre: string
  icono: string
  color: string
  total: number
  porcentaje: number
}

type Props = {
  categorias: CategoriaStat[]
  proyectoId: string
  mesAno: string
}

function fmt(n: number) {
  return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function ListaCategorias({ categorias, proyectoId, mesAno }: Props) {
  const router = useRouter()

  return (
    <div className="bg-[#FFF8EC] rounded-2xl border-2 border-[#222222] divide-y divide-[#222222]/10" style={{ boxShadow: '4px 4px 0px 0px #222222' }}>
      {categorias.map(cat => {
        const Icono = ICONOS[cat.icono] ?? Package
        const tieneGasto = cat.total > 0

        return (
          <button
            key={cat.catId}
            type="button"
            onClick={() => {
              if (tieneGasto) {
                router.push(`/proyectos/${proyectoId}?mes=${mesAno}&cat=${cat.catId}`)
              }
            }}
            className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors ${
              tieneGasto ? 'hover:bg-[#FFE9CE] cursor-pointer' : 'cursor-default opacity-50'
            }`}
          >
            {/* Icono */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-[#222222]/20"
              style={{ backgroundColor: cat.color + '33' }}
            >
              <Icono className="w-4 h-4" style={{ color: cat.color }} />
            </div>

            {/* Nombre + barra de progreso */}
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-[#222222] text-sm font-black truncate">{cat.nombre}</p>
              <div className="h-2 bg-[#222222]/10 rounded-full overflow-hidden border border-[#222222]/20">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${cat.porcentaje}%`, backgroundColor: cat.color }}
                />
              </div>
            </div>

            {/* Importe + % */}
            <div className="flex-shrink-0 text-right">
              <p className={`text-sm font-black ${tieneGasto ? 'text-[#FD4C38]' : 'text-[#222222]/30'}`}>
                {tieneGasto ? `-${fmt(cat.total)} €` : '0,00 €'}
              </p>
              <p className="text-[#222222]/40 text-xs font-bold">
                {tieneGasto ? `${Math.round(cat.porcentaje)}%` : '—'}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
