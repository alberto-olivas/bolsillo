type Movimiento = { tipo: string; cantidad: number | string }

type Props = {
  movimientos: Movimiento[]
}

export default function ResumenMes({ movimientos }: Props) {
  const gastos = movimientos
    .filter(m => m.tipo === 'gasto')
    .reduce((sum, m) => sum + Number(m.cantidad), 0)
  const ingresos = movimientos
    .filter(m => m.tipo === 'ingreso')
    .reduce((sum, m) => sum + Number(m.cantidad), 0)
  const saldo = ingresos - gastos

  function fmt(n: number) {
    return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="bg-neutral-900 rounded-xl p-3 border border-neutral-800">
        <p className="text-neutral-500 text-xs">Gastos</p>
        <p className="text-red-400 font-semibold text-sm mt-0.5">-{fmt(gastos)} €</p>
      </div>
      <div className="bg-neutral-900 rounded-xl p-3 border border-neutral-800">
        <p className="text-neutral-500 text-xs">Ingresos</p>
        <p className="text-green-400 font-semibold text-sm mt-0.5">+{fmt(ingresos)} €</p>
      </div>
      <div className="bg-neutral-900 rounded-xl p-3 border border-neutral-800">
        <p className="text-neutral-500 text-xs">Saldo</p>
        <p className={`font-semibold text-sm mt-0.5 ${saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {saldo >= 0 ? '+' : ''}{fmt(saldo)} €
        </p>
      </div>
    </div>
  )
}
