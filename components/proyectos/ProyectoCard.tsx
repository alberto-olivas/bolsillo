'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FolderOpen, Users, Copy, Check, Lock, ArrowRight } from 'lucide-react'

type Miembro = {
  user_id: string
  perfiles: { nombre: string | null; email: string } | null
}

type Props = {
  id: string
  nombre: string
  tipo: 'personal' | 'compartido'
  codigo_invitacion: string | null
  miembros: Miembro[]
}

export default function ProyectoCard({ id, nombre, tipo, codigo_invitacion, miembros }: Props) {
  const [copiado, setCopiado] = useState(false)

  function copiarCodigo() {
    if (!codigo_invitacion) return
    navigator.clipboard.writeText(codigo_invitacion)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 space-y-3">
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
            {tipo === 'personal'
              ? <FolderOpen className="w-4 h-4 text-indigo-500" />
              : <Users className="w-4 h-4 text-indigo-500" />
            }
          </div>
          <div>
            <p className="text-neutral-900 dark:text-white font-medium text-sm leading-tight">{nombre}</p>
            <span className={`text-xs font-medium ${tipo === 'personal' ? 'text-neutral-500' : 'text-indigo-500'}`}>
              {tipo === 'personal' ? 'Personal' : 'Compartido'}
            </span>
          </div>
        </div>
        {tipo === 'personal' && (
          <Lock className="w-4 h-4 text-neutral-400 dark:text-neutral-600 flex-shrink-0 mt-0.5" />
        )}
      </div>

      {/* Código de invitación (solo proyectos compartidos) */}
      {tipo === 'compartido' && codigo_invitacion && (
        <div className="flex items-center justify-between bg-neutral-200 dark:bg-neutral-800 rounded-xl px-3 py-2">
          <div>
            <p className="text-neutral-500 text-xs">Código de invitación</p>
            <p className="text-neutral-900 dark:text-white font-mono font-bold tracking-widest text-sm">{codigo_invitacion}</p>
          </div>
          <button
            onClick={copiarCodigo}
            className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors p-1"
            title="Copiar código"
          >
            {copiado ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Miembros (solo compartidos) */}
      {tipo === 'compartido' && miembros.length > 0 && (
        <div className="space-y-1">
          <p className="text-neutral-500 text-xs">{miembros.length} {miembros.length === 1 ? 'miembro' : 'miembros'}</p>
          <div className="flex flex-wrap gap-1">
            {miembros.map(m => (
              <span key={m.user_id} className="text-xs bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-full px-2 py-0.5">
                {m.perfiles?.nombre ?? m.perfiles?.email ?? 'Desconocido'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Botón ver movimientos */}
      <Link
        href={`/proyectos/${id}`}
        className="flex items-center justify-between w-full bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-xl px-4 py-2.5 transition-colors text-sm"
      >
        <span>Ver movimientos</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}
