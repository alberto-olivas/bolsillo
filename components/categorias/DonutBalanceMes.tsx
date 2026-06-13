'use client'

type Props = {
  totalGastos: number
  totalIngresos: number
}

function fmt(n: number) {
  return Math.abs(n).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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

export default function DonutBalanceMes({ totalGastos, totalIngresos }: Props) {
  console.log('DonutBalanceMes renderizando', { totalIngresos, totalGastos })
  if (totalGastos === 0 && totalIngresos === 0) return null

  const CX = 100, CY = 100, R = 85, r = 58
  const saldo = totalIngresos - totalGastos

  // Gastos saturan en 100% del círculo si superan los ingresos
  const gastadoAngulo = totalIngresos === 0 ? 360 : Math.min(totalGastos / totalIngresos, 1) * 360

  const segments: { key: string; path: string; color: string }[] = []
  if (gastadoAngulo > 0) {
    const path = arcPath(CX, CY, R, r, 0, gastadoAngulo)
    if (path) segments.push({ key: 'gastos', path, color: '#ef4444' })
  }
  if (gastadoAngulo < 360) {
    const path = arcPath(CX, CY, R, r, gastadoAngulo, 360)
    if (path) segments.push({ key: 'restante', path, color: '#22c55e' })
  }

  // Mensaje y color del texto según la situación
  let mensaje: string
  let colorMensaje: string

  if (totalIngresos === 0) {
    mensaje = 'Sin ingresos registrados este mes'
    colorMensaje = 'text-neutral-500'
  } else if (totalGastos > totalIngresos) {
    const excesoPct = Math.round(((totalGastos - totalIngresos) / totalIngresos) * 100)
    mensaje = `Has gastado un ${excesoPct}% más de lo que ingresaste este mes`
    colorMensaje = 'text-red-400'
  } else {
    const pct = Math.round((totalGastos / totalIngresos) * 100)
    mensaje = `Has gastado el ${pct}% de tus ingresos este mes`
    colorMensaje = pct > 80 ? 'text-amber-400' : 'text-neutral-500'
  }

  return (
    <div className="space-y-1">
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 200 200" className="w-52 h-52">
          {segments.map(seg => (
            <path key={seg.key} d={seg.path} fill={seg.color} />
          ))}
          <text x={CX} y={CY - 8} textAnchor="middle" className="fill-neutral-500" fontSize="10">Saldo</text>
          <text
            x={CX} y={CY + 10}
            textAnchor="middle"
            className={saldo >= 0 ? 'fill-neutral-900 dark:fill-white' : 'fill-red-400'}
            fontSize="14"
            fontWeight="bold"
          >
            {saldo >= 0 ? '+' : '-'}{fmt(saldo)} €
          </text>
        </svg>
      </div>
      <p className={`text-center text-xs px-4 ${colorMensaje}`}>{mensaje}</p>
    </div>
  )
}
