'use client'

import { useRouter } from 'next/navigation'

type BarDato = {
  mesKey: string
  mesLabel: string
  total: number
}

type Props = {
  datos: BarDato[]
  proyectoId: string
  mesResaltado: string
}

function fmtBar(n: number): string {
  if (n >= 1000) {
    return `${(n / 1000).toLocaleString('es-ES', { maximumFractionDigits: 1 })}k€`
  }
  return `${Math.round(n)}€`
}

export default function GraficoBarras({ datos, proyectoId, mesResaltado }: Props) {
  const router = useRouter()

  const maxTotal = Math.max(...datos.map(d => d.total), 1)

  const W = 320
  const BAR_H = 140
  const PAD_TOP = 22
  const PAD_BOT = 24
  const TOTAL_H = PAD_TOP + BAR_H + PAD_BOT
  const BAR_W = 36
  const N = datos.length
  const GAP = (W - N * BAR_W) / (N + 1)
  const MIN_BAR = 4

  return (
    <svg viewBox={`0 0 ${W} ${TOTAL_H}`} className="w-full" style={{ maxHeight: '210px' }}>
      {datos.map((d, i) => {
        const barHeight = d.total > 0
          ? Math.max((d.total / maxTotal) * BAR_H, MIN_BAR)
          : MIN_BAR
        const x = GAP + i * (BAR_W + GAP)
        const y = PAD_TOP + BAR_H - barHeight
        const activa = d.mesKey === mesResaltado

        return (
          <g
            key={d.mesKey}
            onClick={() => router.push(`/proyectos/${proyectoId}?mes=${d.mesKey}`)}
            style={{ cursor: 'pointer' }}
          >
            {/* Zona de tap ampliada */}
            <rect x={x} y={PAD_TOP} width={BAR_W} height={BAR_H} fill="transparent" />
            {/* Barra */}
            <rect
              x={x}
              y={y}
              width={BAR_W}
              height={barHeight}
              rx={6}
              fill="#6366f1"
              opacity={activa ? 1 : 0.3}
            />
            {/* Importe encima */}
            {d.total > 0 && (
              <text
                x={x + BAR_W / 2}
                y={y - 5}
                textAnchor="middle"
                fontSize={9}
                fill={activa ? '#6366f1' : '#9ca3af'}
                fontWeight={activa ? '600' : '400'}
              >
                {fmtBar(d.total)}
              </text>
            )}
            {/* Etiqueta de mes */}
            <text
              x={x + BAR_W / 2}
              y={PAD_TOP + BAR_H + 16}
              textAnchor="middle"
              fontSize={10}
              fill={activa ? '#6366f1' : '#6b7280'}
              fontWeight={activa ? '600' : '400'}
            >
              {d.mesLabel}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
