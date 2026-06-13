'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { ICONOS } from '@/lib/iconos-categorias'
import { Package } from 'lucide-react'
import PresupuestoModal from './PresupuestoModal'

type Categoria = {
  id: string
  nombre: string
  icono: string
  color: string
}

type Presupuesto = {
  id: string
  categoriaId: string
  limite: number
  esFijo: boolean
  mesAno: string | null
}

type Props = {
  categorias: Categoria[]
  presupuestos: Presupuesto[]
  gastadoPorCat: { [catId: string]: number }
  proyectoId: string
  mesAno: string
}

function fmt(n: number) {
  return Math.abs(n).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function ListaPresupuestos({
  categorias, presupuestos, gastadoPorCat, proyectoId, mesAno,
}: Props) {
  const [catSeleccionada, setCatSeleccionada] = useState<Categoria | null>(null)

  // Presupuesto efectivo por categoría (puntual tiene prioridad sobre fijo)
  const presupuestoPorCat = new Map<string, Presupuesto>()
  for (const p of presupuestos) {
    const existing = presupuestoPorCat.get(p.categoriaId)
    if (!existing || !p.esFijo) {
      presupuestoPorCat.set(p.categoriaId, p)
    }
  }

  const conPresupuesto = categorias.filter(c => presupuestoPorCat.has(c.id))
  const sinPresupuesto = categorias.filter(c => !presupuestoPorCat.has(c.id))

  const presupuestoSeleccionado = catSeleccionada
    ? (presupuestoPorCat.get(catSeleccionada.id) ?? null)
    : null

  return (
    <>
      {/* Categorías con presupuesto */}
      {conPresupuesto.length > 0 && (
        <div className="space-y-2">
          <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-800">
            {conPresupuesto.map(cat => {
              const Icono = ICONOS[cat.icono] ?? Package
              const presupuesto = presupuestoPorCat.get(cat.id)!
              const gastado = gastadoPorCat[cat.id] ?? 0
              const exceso = gastado - presupuesto.limite
              const excedido = exceso > 0
              const pct = Math.min(100, (gastado / presupuesto.limite) * 100)

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCatSeleccionada(cat)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                >
                  {/* Icono */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: cat.color + '33' }}
                  >
                    <Icono className="w-4 h-4" style={{ color: cat.color }} />
                  </div>

                  {/* Nombre + barra */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-neutral-900 dark:text-white text-sm font-medium truncate">{cat.nombre}</p>
                      {presupuesto.esFijo && (
                        <span className="text-xs text-neutral-400 dark:text-neutral-500 bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 rounded-full flex-shrink-0">
                          Fijo
                        </span>
                      )}
                    </div>
                    <div className="h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: excedido ? '#ef4444' : '#22c55e',
                        }}
                      />
                    </div>
                  </div>

                  {/* Importes */}
                  <div className="flex-shrink-0 text-right">
                    {excedido ? (
                      <>
                        <p className="text-sm font-semibold text-red-400">+{fmt(exceso)} €</p>
                        <p className="text-xs text-neutral-500">{fmt(gastado)} / {fmt(presupuesto.limite)} €</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                          {fmt(gastado)} €
                        </p>
                        <p className="text-xs text-neutral-500">de {fmt(presupuesto.limite)} €</p>
                      </>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Categorías sin presupuesto */}
      {sinPresupuesto.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-neutral-500 dark:text-neutral-400 text-xs font-medium uppercase tracking-wider">
            Sin presupuesto
          </h3>
          <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-800">
            {sinPresupuesto.map(cat => {
              const Icono = ICONOS[cat.icono] ?? Package
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCatSeleccionada(cat)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 opacity-50"
                    style={{ backgroundColor: cat.color + '33' }}
                  >
                    <Icono className="w-4 h-4" style={{ color: cat.color }} />
                  </div>
                  <p className="flex-1 text-neutral-500 text-sm">{cat.nombre}</p>
                  <div className="flex items-center gap-1 text-indigo-500 flex-shrink-0">
                    <Plus className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Añadir límite</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {categorias.length === 0 && (
        <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 text-center">
          <p className="text-neutral-500 text-sm">No hay categorías de gasto en este proyecto.</p>
        </div>
      )}

      {/* Modal */}
      {catSeleccionada && (
        <PresupuestoModal
          categoria={catSeleccionada}
          presupuesto={presupuestoSeleccionado}
          proyectoId={proyectoId}
          mesAno={mesAno}
          onClose={() => setCatSeleccionada(null)}
        />
      )}
    </>
  )
}
