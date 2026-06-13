'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown, Check } from 'lucide-react'

type Proyecto = { id: string; nombre: string; tipo: string }

type Props = {
  actual: Proyecto
  todos: Proyecto[]
}

export default function SelectorProyecto({ actual, todos }: Props) {
  const [abierto, setAbierto] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const mes = searchParams.get('mes')
  const mesParam = mes ? `?mes=${mes}` : ''

  const hayOtros = todos.length > 1

  function navegar(id: string) {
    setAbierto(false)
    router.push(`/proyectos/${id}${mesParam}`)
  }

  return (
    <div className="relative flex-1">
      <button
        type="button"
        onClick={() => hayOtros && setAbierto(!abierto)}
        className={`flex items-center gap-1 text-left ${hayOtros ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <div>
          <p className="text-neutral-900 dark:text-white font-bold text-lg leading-tight">{actual.nombre}</p>
          <p className="text-neutral-500 text-xs capitalize">{actual.tipo}</p>
        </div>
        {hayOtros && (
          <ChevronDown className={`w-4 h-4 text-neutral-400 mt-0.5 transition-transform flex-shrink-0 ${abierto ? 'rotate-180' : ''}`} />
        )}
      </button>

      {abierto && hayOtros && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setAbierto(false)} />
          <div className="absolute left-0 top-full mt-2 z-50 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden min-w-48">
            {todos.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => navegar(p.id)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-left"
              >
                <div>
                  <p className="text-neutral-900 dark:text-white text-sm font-medium">{p.nombre}</p>
                  <p className="text-neutral-500 text-xs capitalize">{p.tipo}</p>
                </div>
                {p.id === actual.id && <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
