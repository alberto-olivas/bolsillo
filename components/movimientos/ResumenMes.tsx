type Movimiento = { tipo: string; cantidad: number | string }

type Props = {
  movimientos: Movimiento[]
  arrastreConfirmado?: number
  mesLabelAnterior?: string
}

function fmt(n: number) {
  return Math.abs(n).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function ResumenMes({ movimientos, arrastreConfirmado = 0, mesLabelAnterior }: Props) {
  const gastos = movimientos
    .filter(m => m.tipo === 'gasto')
    .reduce((sum, m) => sum + Number(m.cantidad), 0)
  const ingresos = movimientos
    .filter(m => m.tipo === 'ingreso')
    .reduce((sum, m) => sum + Number(m.cantidad), 0)
  const saldo = arrastreConfirmado + ingresos - gastos

  return (
    <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800">
      <p className="text-neutral-500 text-xs uppercase tracking-wider">Saldo del mes</p>
      <p className={`text-3xl font-bold mt-1 ${saldo >= 0 ? 'text-neutral-900 dark:text-white' : 'text-red-400'}`}>
        {saldo >= 0 ? '+' : '-'}{fmt(saldo)} €
      </p>
      {arrastreConfirmado !== 0 && mesLabelAnterior && (
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
          Incluye arrastre de {mesLabelAnterior}:{' '}
          <span className={arrastreConfirmado >= 0 ? 'text-green-400' : 'text-red-400'}>
            {arrastreConfirmado >= 0 ? '+' : '-'}{fmt(arrastreConfirmado)} €
          </span>
        </p>
      )}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <div className="bg-neutral-200 dark:bg-neutral-800 rounded-xl p-3">
          <p className="text-neutral-500 text-xs">Gastos</p>
          <p className="text-red-400 font-semibold text-sm mt-1">-{fmt(gastos)} €</p>
        </div>
        <div className="bg-neutral-200 dark:bg-neutral-800 rounded-xl p-3">
          <p className="text-neutral-500 text-xs">Ingresos</p>
          <p className="text-green-400 font-semibold text-sm mt-1">+{fmt(ingresos)} €</p>
        </div>
      </div>
    </div>
  )
}
