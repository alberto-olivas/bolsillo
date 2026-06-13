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
    <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-800">
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
              tieneGasto ? 'hover:bg-neutral-200 dark:hover:bg-neutral-800 cursor-pointer' : 'cursor-default opacity-50'
            }`}
          >
            {/* Icono */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: cat.color + '33' }}
            >
              <Icono className="w-4 h-4" style={{ color: cat.color }} />
            </div>

            {/* Nombre + barra de progreso */}
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-neutral-900 dark:text-white text-sm font-medium truncate">{cat.nombre}</p>
              <div className="h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${cat.porcentaje}%`, backgroundColor: cat.color }}
                />
              </div>
            </div>

            {/* Importe + % */}
            <div className="flex-shrink-0 text-right">
              <p className={`text-sm font-semibold ${tieneGasto ? 'text-red-400' : 'text-neutral-400 dark:text-neutral-600'}`}>
                {tieneGasto ? `-${fmt(cat.total)} €` : '0,00 €'}
              </p>
              <p className="text-neutral-500 text-xs">
                {tieneGasto ? `${Math.round(cat.porcentaje)}%` : '—'}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
