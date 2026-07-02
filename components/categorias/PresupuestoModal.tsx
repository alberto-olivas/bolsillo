'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ICONOS } from '@/lib/iconos-categorias'
import { Package } from 'lucide-react'
import { guardarPresupuesto, eliminarPresupuesto } from '@/app/actions/presupuestos'

type Categoria = {
  id: string
  nombre: string
  icono: string
  color: string
}

type PresupuestoExistente = {
  id: string
  limite: number
  esFijo: boolean
  mesAno: string | null
}

type Props = {
  categoria: Categoria
  presupuesto: PresupuestoExistente | null
  proyectoId: string
  mesAno: string
  onClose: () => void
}

function fmtMes(mesAno: string) {
  const [year, month] = mesAno.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
}

export default function PresupuestoModal({ categoria, presupuesto, proyectoId, mesAno, onClose }: Props) {
  const [limiteStr, setLimiteStr] = useState(presupuesto ? String(presupuesto.limite) : '')
  const [esFijo, setEsFijo] = useState(presupuesto ? presupuesto.esFijo : true)
  const [loading, setLoading] = useState(false)
  const [loadingEliminar, setLoadingEliminar] = useState(false)
  const [error, setError] = useState('')
  const [cerrando, setCerrando] = useState(false)

  const panelRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef(0)
  const dragY = useRef(0)

  const router = useRouter()

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])
  const Icono = ICONOS[categoria.icono] ?? Package
  const limite = parseFloat(limiteStr.replace(',', '.'))

  function triggerClose() {
    setCerrando(true)
    setTimeout(() => {
      setCerrando(false)
      onClose()
    }, 280)
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchMove(e: React.TouchEvent) {
    const delta = e.touches[0].clientY - touchStartY.current
    if (delta > 0 && panelRef.current) {
      dragY.current = delta
      panelRef.current.style.transform = `translateY(${delta}px)`
      panelRef.current.style.transition = 'none'
      panelRef.current.style.animation = 'none'
    }
  }

  function handleTouchEnd() {
    if (dragY.current > 100) {
      dragY.current = 0
      triggerClose()
    } else {
      dragY.current = 0
      if (panelRef.current) {
        panelRef.current.style.transform = 'translateY(0)'
        panelRef.current.style.transition = 'transform 200ms ease'
        panelRef.current.style.animation = ''
      }
    }
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault()
    if (!limiteStr || isNaN(limite) || limite <= 0) return
    setLoading(true)
    setError('')

    if (presupuesto && presupuesto.esFijo !== esFijo) {
      await eliminarPresupuesto(presupuesto.id)
    }

    const result = await guardarPresupuesto(proyectoId, categoria.id, limite, esFijo, mesAno)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setLoading(false)
      router.refresh()
      triggerClose()
    }
  }

  async function handleEliminar() {
    if (!presupuesto) return
    setLoadingEliminar(true)
    const result = await eliminarPresupuesto(presupuesto.id)
    if (result.error) {
      setError(result.error)
      setLoadingEliminar(false)
    } else {
      setLoadingEliminar(false)
      router.refresh()
      triggerClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[#222222]/60"
      onClick={triggerClose}
    >
      <div
        ref={panelRef}
        className="w-full max-w-sm bg-[#FFF8EC] dark:bg-[#2A2420] rounded-t-3xl p-6 pb-10 space-y-5 max-h-[85vh] overflow-y-auto border-t-2 border-x-2 border-[#222222] dark:border-[#F5E6D0]"
        style={{
          animation: cerrando ? 'slideDown 280ms ease forwards' : 'slideUp 300ms ease forwards',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle — zona de swipe */}
        <div
          className="flex justify-center pb-1 -mt-2 py-2"
          style={{ touchAction: 'none' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-10 h-1 bg-[#222222]/20 dark:bg-[#F5E6D0]/20 rounded-full" />
        </div>

        {/* Cabecera */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-[#222222]/20 dark:border-[#F5E6D0]/20"
            style={{ backgroundColor: categoria.color + '33' }}
          >
            <Icono className="w-5 h-5" style={{ color: categoria.color }} />
          </div>
          <div>
            <p className="text-base font-black text-[#222222] dark:text-[#F5E6D0]">{categoria.nombre}</p>
            <p className="text-xs text-[#222222]/50 dark:text-[#F5E6D0]/50 font-bold">
              {presupuesto ? 'Editar presupuesto' : 'Nuevo presupuesto'}
            </p>
          </div>
        </div>

        <form onSubmit={handleGuardar} className="space-y-4">
          {/* Límite */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wide text-[#222222]/50 dark:text-[#F5E6D0]/50">
              Límite mensual (€)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={limiteStr}
              onChange={e => setLimiteStr(e.target.value)}
              placeholder="0,00"
              className="w-full bg-[#FFE9CE] dark:bg-[#332E28] border-2 border-[#222222] dark:border-[#F5E6D0] text-[#222222] dark:text-[#F5E6D0] placeholder-[#222222]/40 dark:placeholder-[#F5E6D0]/40 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#FFD80B]"
            />
          </div>

          {/* Toggle Fijo / Puntual */}
          <div className="flex items-center justify-between bg-[#FFE9CE] dark:bg-[#332E28] rounded-xl px-4 py-3 border-2 border-[#222222] dark:border-[#F5E6D0]">
            <div>
              <p className="text-sm text-[#222222] dark:text-[#F5E6D0] font-black">Repetir cada mes</p>
              <p className="text-xs text-[#222222]/50 dark:text-[#F5E6D0]/50 mt-0.5 font-medium">
                {esFijo ? 'Se aplica a todos los meses' : `Solo para ${fmtMes(mesAno)}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEsFijo(v => !v)}
              className={`relative inline-flex w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                esFijo ? 'bg-[#222222] dark:bg-[#F5E6D0]' : 'bg-[#222222]/20 dark:bg-[#F5E6D0]/20'
              }`}
            >
              <span
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  esFijo ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {error && (
            <p className="text-[#FD4C38] text-xs font-black bg-[#FFE2DD] dark:bg-[#3A1A16] px-3 py-2 rounded-xl border-2 border-[#FD4C38]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !limiteStr || isNaN(limite) || limite <= 0}
            className="w-full bg-[#222222] hover:bg-[#000000] disabled:opacity-50 disabled:cursor-not-allowed text-[#FFD80B] font-black py-3 rounded-xl text-sm transition-colors border-2 border-[#222222]"
          >
            {loading ? 'Guardando...' : 'Guardar presupuesto'}
          </button>
        </form>

        {presupuesto && (
          <button
            onClick={handleEliminar}
            disabled={loadingEliminar}
            className="w-full text-[#FD4C38] hover:text-[#e03020] disabled:opacity-50 text-sm font-black py-2 transition-colors"
          >
            {loadingEliminar ? 'Eliminando...' : 'Eliminar presupuesto'}
          </button>
        )}
      </div>
    </div>
  )
}
