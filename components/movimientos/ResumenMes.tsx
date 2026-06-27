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
    <div className="bg-[#FFF8EC] rounded-2xl p-5 border-2 border-[#222222]" style={{ boxShadow: '4px 4px 0px 0px #222222' }}>
      <p className="text-[#222222]/50 text-[10px] font-black uppercase tracking-widest">Saldo del mes</p>
      <p className={`text-3xl font-black mt-1 tracking-tight ${saldo >= 0 ? 'text-neutral-900 dark:text-white' : 'text-red-400'}`}>
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
        <div className="bg-[#FFE2DD] rounded-xl p-3 border-2 border-[#222222]">
          <p className="text-[#222222]/50 text-[10px] font-black uppercase tracking-wide">Gastos</p>
          <p className="text-[#FD4C38] font-black text-sm mt-1">-{fmt(gastos)} €</p>
        </div>
        <div className="bg-[#E8F8E0] rounded-xl p-3 border-2 border-[#222222]">
          <p className="text-[#222222]/50 text-[10px] font-black uppercase tracking-wide">Ingresos</p>
          <p className="text-[#2FA84F] font-black text-sm mt-1">+{fmt(ingresos)} €</p>
        </div>
      </div>
    </div>
  )
}
