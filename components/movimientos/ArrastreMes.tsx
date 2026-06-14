'use client'

import { useState } from 'react'
import { ArrowLeftRight, X, Check } from 'lucide-react'
import { confirmarArrastre, descartarArrastre } from '@/app/actions/arrastres'

type Props = {
  arrastre: { id: string; importe: number }
  mesLabelAnterior: string
}

function fmt(n: number) {
  return Math.abs(n).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function ArrastreMes({ arrastre, mesLabelAnterior }: Props) {
  const [cargando, setCargando] = useState<'confirmar' | 'descartar' | null>(null)
  const [error, setError] = useState('')

  const positivo = arrastre.importe >= 0

  async function handleConfirmar() {
    setCargando('confirmar')
    setError('')
    try {
      await confirmarArrastre(arrastre.id)
      window.location.reload()
    } catch (e: any) {
      setError(e.message)
      setCargando(null)
    }
  }

  async function handleDescartar() {
    setCargando('descartar')
    setError('')
    try {
      await descartarArrastre(arrastre.id)
      window.location.reload()
    } catch (e: any) {
      setError(e.message)
      setCargando(null)
    }
  }

  return (
    <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl px-5 py-4 border border-indigo-400/30 space-y-4">
      <p className="text-neutral-500 dark:text-neutral-400 text-xs font-medium uppercase tracking-wider">
        Arrastre de mes anterior
      </p>

      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: '#6366f133' }}
        >
          <ArrowLeftRight className="w-4 h-4" style={{ color: '#6366f1' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-900 dark:text-white">
            {mesLabelAnterior} cerró con{' '}
            <span className={positivo ? 'text-green-400' : 'text-red-400'}>
              {positivo ? '+' : '-'}{fmt(arrastre.importe)} €
            </span>
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            ¿Quieres arrastrarlo a este mes?
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleDescartar}
          disabled={!!cargando}
          className="flex-1 flex items-center justify-center gap-1.5 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 disabled:opacity-40 text-neutral-600 dark:text-neutral-400 font-medium py-2.5 rounded-xl text-sm transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          {cargando === 'descartar' ? 'Descartando...' : 'Descartar'}
        </button>
        <button
          onClick={handleConfirmar}
          disabled={!!cargando}
          className="flex-1 flex items-center justify-center gap-1.5 bg-green-500/10 hover:bg-green-500/20 disabled:opacity-40 text-green-500 font-medium py-2.5 rounded-xl text-sm transition-colors"
        >
          <Check className="w-3.5 h-3.5" />
          {cargando === 'confirmar' ? 'Confirmando...' : 'Confirmar'}
        </button>
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}
