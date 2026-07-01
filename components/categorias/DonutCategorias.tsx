'use client'

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
  className?: string
}

function fmt(n: number) {
  return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(cx: number, cy: number, R: number, r: number, start: number, end: number): string {
  const gap = 1.5
  const s = start + gap
  const e = end - gap
  if (e <= s) return ''
  const p1 = polarToXY(cx, cy, R, s)
  const p2 = polarToXY(cx, cy, r, s)
  const p3 = polarToXY(cx, cy, R, e)
  const p4 = polarToXY(cx, cy, r, e)
  const large = e - s > 180 ? 1 : 0
  return `M ${p1.x} ${p1.y} A ${R} ${R} 0 ${large} 1 ${p3.x} ${p3.y} L ${p4.x} ${p4.y} A ${r} ${r} 0 ${large} 0 ${p2.x} ${p2.y} Z`
}

export default function DonutCategorias({ categorias, totalGastos, className }: Props) {
  const CX = 100, CY = 100, R = 85, r = 58
  const conGasto = categorias.filter(c => c.total > 0)

  if (conGasto.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3">
        <svg viewBox="0 0 200 200" className={className ?? 'w-48 h-48'}>
          <circle cx={CX} cy={CY} r={R} fill="none" className="stroke-neutral-200 dark:stroke-neutral-800" strokeWidth={R - r} />
          <text x={CX} y={CY - 6} textAnchor="middle" fill="#22222260" fontSize="11">Sin gastos</text>
          <text x={CX} y={CY + 10} textAnchor="middle" fill="#22222260" fontSize="11">este mes</text>
        </svg>
      </div>
    )
  }

  let angle = 0
  const segments = conGasto.map(cat => {
    const sweep = (cat.total / totalGastos) * 360
    const path = arcPath(CX, CY, R, r, angle, angle + sweep)
    angle += sweep
    return { ...cat, path }
  })

  return (
    <div className="bg-[#FFF8EC] dark:bg-[#2A2420] rounded-2xl border-2 border-[#222222] dark:border-[#F5E6D0] p-4" style={{ boxShadow: '4px 4px 0px 0px var(--shadow-main)' }}>
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <svg viewBox="0 0 200 200" className="w-24 h-24">
            {segments.map(seg => (
              <path key={seg.catId} d={seg.path} fill={seg.color} />
            ))}
            <text x={CX} y={CY - 6} textAnchor="middle" fill="#22222280" fontSize="10">Total</text>
            <text x={CX} y={CY + 9} textAnchor="middle" fill="#222222" fontSize="11" fontWeight="900">
              €{Math.round(totalGastos).toLocaleString('es-ES')}
            </text>
          </svg>
        </div>
        <div className="flex-1 space-y-1.5 overflow-hidden">
          {conGasto.slice(0, 4).map(cat => (
            <div key={cat.catId} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-3 h-3 rounded-sm flex-shrink-0 border-2 border-[#222222] dark:border-[#F5E6D0]" style={{ background: cat.color }} />
                <span className="text-[11px] font-black text-[#222222] dark:text-[#F5E6D0] truncate">{cat.nombre}</span>
              </div>
              <span className="text-[11px] font-black text-[#222222] dark:text-[#F5E6D0] flex-shrink-0">€{Math.round(cat.total).toLocaleString('es-ES')}</span>
            </div>
          ))}
          {conGasto.length > 4 && (
            <p className="text-[10px] text-[#222222]/40 dark:text-[#F5E6D0]/40 font-bold">+{conGasto.length - 4} más</p>
          )}
        </div>
      </div>
    </div>
  )
}
