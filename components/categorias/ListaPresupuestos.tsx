'use client'

import { useState } from 'react'
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
        <div className="space-y-3">
          {conPresupuesto.map(cat => {
            const Icono = ICONOS[cat.icono] ?? Package
            const presupuesto = presupuestoPorCat.get(cat.id)!
            const gastado = gastadoPorCat[cat.id] ?? 0
            const exceso = gastado - presupuesto.limite
            const excedido = exceso > 0
            const cerca = !excedido && (gastado / presupuesto.limite) >= 0.8
            const pct = Math.min(100, (gastado / presupuesto.limite) * 100)

            const barColor = excedido ? '#FD4C38' : cerca ? '#FFD80B' : '#2FA84F'
            const borderColor = excedido ? '#FD4C38' : '#222222'
            const shadowColor = excedido ? '#FD4C38' : '#222222'
            const bgColor = excedido ? '#FFE2DD' : '#FFF8EC'

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCatSeleccionada(cat)}
                className="w-full text-left rounded-2xl p-4 border-2 transition-colors hover:opacity-90"
                style={{
                  background: bgColor,
                  borderColor: borderColor,
                  boxShadow: `3px 3px 0px 0px ${shadowColor}`,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-[#222222]/20"
                      style={{ backgroundColor: cat.color + '33' }}
                    >
                      <Icono className="w-4 h-4" style={{ color: cat.color }} />
                    </div>
                    <p className="text-[#222222] text-sm font-black">{cat.nombre}</p>
                    {presupuesto.esFijo && (
                      <span className="text-[9px] font-black text-[#222222]/40 bg-[#222222]/10 px-1.5 py-0.5 rounded-full">Fijo</span>
                    )}
                  </div>
                  <div className="text-right">
                    {excedido ? (
                      <p className="text-xs font-black text-[#FD4C38]">
                        €{fmt(gastado)} / €{fmt(presupuesto.limite)} · +€{fmt(exceso)}
                      </p>
                    ) : (
                      <p className="text-xs font-black text-[#222222]/60">
                        €{fmt(gastado)} / €{fmt(presupuesto.limite)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="h-3 bg-[#222222]/10 rounded-full overflow-hidden border border-[#222222]/20">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: barColor }}
                  />
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Categorías sin presupuesto */}
      {sinPresupuesto.length > 0 && (
        <div className="bg-[#FFF8C7] rounded-2xl border-2 border-[#222222] p-4"
          style={{ boxShadow: '3px 3px 0px 0px #222222' }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#222222]/50 mb-3">Sin presupuesto</p>
          <div className="flex flex-wrap gap-2">
            {sinPresupuesto.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCatSeleccionada(cat)}
                className="flex items-center gap-1.5 bg-[#FFF8EC] border-2 border-[#222222] rounded-full px-3 py-1.5 text-xs font-black text-[#222222] hover:bg-[#FFE9CE] transition-colors"
              >
                {cat.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {categorias.length === 0 && (
        <div className="bg-[#FFF8EC] rounded-2xl p-6 border-2 border-[#222222] text-center">
          <p className="text-[#222222]/60 text-sm font-bold">No hay categorías de gasto en este proyecto.</p>
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
