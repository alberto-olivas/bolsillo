'use client'

import { useState } from 'react'
import { ICONOS } from '@/lib/iconos-categorias'
import { Package, Check, X } from 'lucide-react'
import { confirmarPendiente, descartarPendiente } from '@/app/actions/pendientes'

type Pendiente = {
  id: string
  gasto_fijo_id: string
  gastos_fijos: {
    nombre: string
    cantidad: number
    tipo: string
    dia_del_mes: number
    categorias: { nombre: string; icono: string; color: string } | null
  } | null
}

type Props = {
  pendientes: Pendiente[]
  proyectoId: string
  mesLabel: string
}

function fmt(n: number) {
  return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function PendienteRow({ pendiente, proyectoId }: { pendiente: Pendiente; proyectoId: string }) {
  const [cargando, setCargando] = useState<'confirmar' | 'descartar' | null>(null)
  const [error, setError] = useState('')

  const gf = pendiente.gastos_fijos
  if (!gf) return null

  const cat = gf.categorias
  const Icono = cat ? (ICONOS[cat.icono] ?? Package) : Package
  const color = cat?.color ?? '#6b7280'

  async function handleConfirmar() {
    setCargando('confirmar')
    setError('')
    try {
      await confirmarPendiente(pendiente.id, pendiente.gasto_fijo_id, proyectoId)
      window.location.reload()
    } catch {
      setError('Error al confirmar.')
      setCargando(null)
    }
  }

  async function handleDescartar() {
    setCargando('descartar')
    setError('')
    try {
      await descartarPendiente(pendiente.id)
      window.location.reload()
    } catch {
      setError('Error al descartar.')
      setCargando(null)
    }
  }

  return (
    <div className="flex items-center gap-3 py-3 border-b border-neutral-800 last:border-0">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: color + '20' }}
      >
        <Icono className="w-4 h-4" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{gf.nombre}</p>
        <p className="text-neutral-500 text-xs">
          {fmt(gf.cantidad)} € · día {gf.dia_del_mes}
          {error && <span className="text-red-400 ml-1">{error}</span>}
        </p>
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        <button
          type="button"
          disabled={cargando !== null}
          onClick={handleDescartar}
          className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 transition-colors"
          title="Descartar este mes"
        >
          <X className="w-4 h-4 text-neutral-400" />
        </button>
        <button
          type="button"
          disabled={cargando !== null}
          onClick={handleConfirmar}
          className="p-2 rounded-xl bg-green-600/20 hover:bg-green-600/30 disabled:opacity-40 transition-colors border border-green-700/50"
          title="Confirmar y registrar"
        >
          <Check className="w-4 h-4 text-green-400" />
        </button>
      </div>
    </div>
  )
}

export default function PendientesConfirmar({ pendientes, proyectoId, mesLabel }: Props) {
  return (
    <div className="space-y-2">
      <h2 className="text-neutral-400 text-xs font-medium uppercase tracking-wider">
        Pendientes de confirmar — {mesLabel}
      </h2>
      <div className="bg-neutral-900 rounded-2xl px-5 border border-yellow-800/40">
        {pendientes.map(p => (
          <PendienteRow key={p.id} pendiente={p} proyectoId={proyectoId} />
        ))}
      </div>
    </div>
  )
}
