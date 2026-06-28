'use client'

type Props = {
  totalGastos: number
  totalIngresos: number
  totalAhorro?: number
}

function fmt(n: number) {
  return Math.abs(n).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(cx: number, cy: number, R: number, r: number, start: number, end: number): string {
  const gap = 2
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

export default function DonutBalanceMes({ totalGastos, totalIngresos, totalAhorro = 0 }: Props) {
  if (totalGastos === 0 && totalIngresos === 0) return null

  const CX = 100, CY = 100, R = 82, r = 55
  const total = totalIngresos + totalGastos + totalAhorro || 1

  const ingresosAngulo = (totalIngresos / total) * 360
  const gastosAngulo = (totalGastos / total) * 360
  const ahorroAngulo = (totalAhorro / total) * 360

  const segments: { key: string; path: string; color: string }[] = []
  let angle = 0

  if (ingresosAngulo > 0) {
    const path = arcPath(CX, CY, R, r, angle, angle + ingresosAngulo)
    if (path) segments.push({ key: 'ingresos', path, color: '#2FA84F' })
    angle += ingresosAngulo
  }
  if (gastosAngulo > 0) {
    const path = arcPath(CX, CY, R, r, angle, angle + gastosAngulo)
    if (path) segments.push({ key: 'gastos', path, color: '#FD4C38' })
    angle += gastosAngulo
  }
  if (ahorroAngulo > 0) {
    const path = arcPath(CX, CY, R, r, angle, angle + ahorroAngulo)
    if (path) segments.push({ key: 'ahorro', path, color: '#8B53FF' })
  }

  const pct = totalIngresos > 0 ? Math.round((totalGastos / totalIngresos) * 100) : 0

  return (
    <div className="bg-[#FFF8EC] rounded-2xl border-2 border-[#222222] p-4" style={{ boxShadow: '4px 4px 0px 0px #222222' }}>
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <svg viewBox="0 0 200 200" className="w-24 h-24">
            {segments.map(seg => (
              <path key={seg.key} d={seg.path} fill={seg.color} />
            ))}
            <text x={CX} y={CY - 6} textAnchor="middle" fill="#22222280" fontSize="11">{pct}%</text>
            <text x={CX} y={CY + 9} textAnchor="middle" fill="#222222" fontSize="10" fontWeight="900">gastado</text>
          </svg>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm border-2 border-[#222222]" style={{ background: '#2FA84F' }} />
              <span className="text-[11px] font-black text-[#222222]">Ingresos</span>
            </div>
            <span className="text-[11px] font-black text-[#222222]">€{fmt(totalIngresos)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm border-2 border-[#222222]" style={{ background: '#FD4C38' }} />
              <span className="text-[11px] font-black text-[#222222]">Gastos</span>
            </div>
            <span className="text-[11px] font-black text-[#222222]">€{fmt(totalGastos)}</span>
          </div>
          {totalAhorro > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm border-2 border-[#222222]" style={{ background: '#8B53FF' }} />
                <span className="text-[11px] font-black text-[#222222]">Ahorro</span>
              </div>
              <span className="text-[11px] font-black text-[#222222]">€{fmt(totalAhorro)}</span>
            </div>
          )}
          <div className="mt-2 px-2 py-1.5 bg-[#FFF8C7] border-2 border-[#222222] rounded-xl">
            <p className="text-[10px] font-black text-[#222222]">Has gastado el {pct}% de tus ingresos</p>
          </div>
        </div>
      </div>
    </div>
  )
}
