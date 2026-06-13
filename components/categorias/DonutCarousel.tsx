'use client'

import { useRef, useState } from 'react'
import DonutCategorias from './DonutCategorias'
import DonutBalanceMes from './DonutBalanceMes'

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
  totalGastos: number
  totalIngresos: number
}

const TITLES = ['Gastos por categoría', 'Ingresos vs gastos']

export default function DonutCarousel({ categorias, totalGastos, totalIngresos }: Props) {
  const [active, setActive] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (!ref.current) return
    const { scrollLeft, offsetWidth } = ref.current
    setActive(Math.round(scrollLeft / offsetWidth))
  }

  const goTo = (i: number) => {
    ref.current?.scrollTo({ left: i * (ref.current.offsetWidth), behavior: 'smooth' })
    setActive(i)
  }

  return (
    <div className="space-y-3">
      <h2 className="text-neutral-500 dark:text-neutral-400 text-xs font-medium uppercase tracking-wider">
        {TITLES[active]}
      </h2>

      <div
        ref={ref}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        <div className="min-w-full snap-center">
          <DonutCategorias categorias={categorias} totalGastos={totalGastos} />
        </div>
        <div className="min-w-full snap-center">
          <DonutBalanceMes totalGastos={totalGastos} totalIngresos={totalIngresos} />
        </div>
      </div>

      <div className="flex justify-center gap-2">
        {[0, 1].map(i => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-2 h-2 rounded-full transition-colors ${
              active === i
                ? 'bg-neutral-900 dark:bg-white'
                : 'bg-neutral-300 dark:bg-neutral-600'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
