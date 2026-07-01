type Movimiento = { tipo: string; cantidad: number | string }

type Props = {
  movimientos: Movimiento[]
  arrastreConfirmado?: number
  mesLabelAnterior?: string
  totalPresupuesto?: number
  gastoPresupuestado?: number
  totalAhorro?: number
}

function fmt(n: number) {
  return Math.abs(n).toLocaleString('es-ES', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  })
}

export default function ResumenMes({
  movimientos,
  arrastreConfirmado = 0,
  mesLabelAnterior,
  totalPresupuesto = 0,
  gastoPresupuestado = 0,
  totalAhorro = 0,
}: Props) {
  const gastos = movimientos
    .filter(m => m.tipo === 'gasto')
    .reduce((sum, m) => sum + Number(m.cantidad), 0)
  const ingresos = movimientos
    .filter(m => m.tipo === 'ingreso')
    .reduce((sum, m) => sum + Number(m.cantidad), 0)

  const pctIngresos = ingresos > 0 ? Math.round((gastos / ingresos) * 100) : 0
  const pctPresupuesto = totalPresupuesto > 0
    ? Math.round((gastoPresupuestado / totalPresupuesto) * 100)
    : 0

  return (
    <div>
      {arrastreConfirmado !== 0 && mesLabelAnterior && (
        <p className="text-xs text-[#222222]/40 dark:text-[#F5E6D0]/40 font-medium mb-3">
          Incluye arrastre de {mesLabelAnterior}:{' '}
          <span className={arrastreConfirmado >= 0 ? 'text-[#2FA84F]' : 'text-[#FD4C38]'}>
            {arrastreConfirmado >= 0 ? '+' : '-'}{fmt(arrastreConfirmado)} €
          </span>
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        {/* Ingresos */}
        <div className="bg-[#E8F8E0] dark:bg-[#1A3A22] rounded-2xl p-4 border-2 border-[#222222] dark:border-[#F5E6D0]"
          style={{ boxShadow: '3px 3px 0px 0px var(--shadow-main)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg">📈</span>
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full border-2 border-[#222222] dark:border-[#F5E6D0] bg-[#2FA84F] text-white">
              +{pctIngresos > 0 ? Math.max(0, 100 - pctIngresos) : 0}%
            </span>
          </div>
          <p className="text-[9px] font-black uppercase tracking-wide text-[#222222]/50 dark:text-[#F5E6D0]/50">Ingresos</p>
          <p className="text-[#2FA84F] font-black text-base mt-0.5">€{fmt(ingresos)}</p>
        </div>

        {/* Gastos */}
        <div className="bg-[#FFE2DD] dark:bg-[#3A1A16] rounded-2xl p-4 border-2 border-[#222222] dark:border-[#F5E6D0]"
          style={{ boxShadow: '3px 3px 0px 0px var(--shadow-main)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg">📉</span>
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full border-2 border-[#222222] dark:border-[#F5E6D0] bg-[#FD4C38] text-white">
              {pctIngresos}%
            </span>
          </div>
          <p className="text-[9px] font-black uppercase tracking-wide text-[#222222]/50 dark:text-[#F5E6D0]/50">Gastos</p>
          <p className="text-[#FD4C38] font-black text-base mt-0.5">€{fmt(gastos)}</p>
        </div>

        {/* Presupuesto usado */}
        <div className="bg-[#FFF8C7] dark:bg-[#3A3010] rounded-2xl p-4 border-2 border-[#222222] dark:border-[#F5E6D0]"
          style={{ boxShadow: '3px 3px 0px 0px var(--shadow-main)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg">🎯</span>
          </div>
          <p className="text-[9px] font-black uppercase tracking-wide text-[#222222]/50 dark:text-[#F5E6D0]/50">Presup. usado</p>
          <p className="text-[#222222] dark:text-[#F5E6D0] font-black text-base mt-0.5">
            {totalPresupuesto > 0 ? `${pctPresupuesto}%` : '—'}
          </p>
        </div>

        {/* Ahorro */}
        <div className="bg-[#F2EAFF] dark:bg-[#2A1F40] rounded-2xl p-4 border-2 border-[#222222] dark:border-[#F5E6D0]"
          style={{ boxShadow: '3px 3px 0px 0px var(--shadow-main)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg">💎</span>
          </div>
          <p className="text-[9px] font-black uppercase tracking-wide text-[#222222]/50 dark:text-[#F5E6D0]/50">Ahorro</p>
          <p className="text-[#8B53FF] font-black text-base mt-0.5">
            {totalAhorro > 0 ? `€${fmt(totalAhorro)}` : '—'}
          </p>
        </div>
      </div>
    </div>
  )
}
