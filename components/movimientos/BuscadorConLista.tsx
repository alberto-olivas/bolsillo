'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Search } from 'lucide-react'
import ListaMovimientos from '@/components/movimientos/ListaMovimientos'

type Movimiento = {
  id: string
  tipo: 'gasto' | 'ingreso'
  cantidad: number
  fecha: string
  descripcion: string | null
  es_fijo: boolean
  gasto_fijo_id: string | null
  categorias: { nombre: string; icono: string; color: string } | null
  perfiles: { nombre: string | null; email: string } | null
  gastos_fijos: { dia_del_mes: number } | null
}

type Categoria = {
  id: string
  nombre: string
  icono: string
  color: string
  tipo: string
}

type Props = {
  movimientos: Movimiento[]
  categorias: Categoria[]
  mesAno: string
  proyectoId: string
}

export default function BuscadorConLista({ movimientos, categorias, mesAno, proyectoId }: Props) {
  const [texto, setTexto] = useState('')
  const router = useRouter()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            autoFocus
            type="text"
            value={texto}
            onChange={e => setTexto(e.target.value)}
            placeholder="Buscar movimientos..."
            className="w-full bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 rounded-xl pl-10 pr-4 py-3 text-sm border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <button
          type="button"
          onClick={() => router.push(`/proyectos/${proyectoId}`)}
          className="flex-shrink-0 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <ListaMovimientos
        movimientos={movimientos}
        categorias={categorias}
        mesAno={mesAno}
        proyectoId={proyectoId}
        busqueda={texto}
      />
    </div>
  )
}
