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
    <div className="bg-[#FFF8EC] dark:bg-[#2A2420] rounded-2xl p-5 border-2 border-[#222222] dark:border-[#F5E6D0] space-y-3" style={{ boxShadow: '4px 4px 0px 0px var(--shadow-main)' }}>
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FFD80B] border-2 border-[#222222] dark:border-[#F5E6D0] flex items-center justify-center flex-shrink-0">
            {tipo === 'personal'
              ? <FolderOpen className="w-4 h-4 text-[#222222]" />
              : <Users className="w-4 h-4 text-[#222222]" />
            }
          </div>
          <div>
            <p className="text-[#222222] dark:text-[#F5E6D0] font-black text-sm leading-tight">{nombre}</p>
            <span className={`text-xs font-medium ${tipo === 'personal' ? 'text-[#222222]/50 dark:text-[#F5E6D0]/50 font-bold' : 'text-[#8B53FF] font-black'}`}>
              {tipo === 'personal' ? 'Personal' : 'Compartido'}
            </span>
          </div>
        </div>
        {tipo === 'personal' && (
          <Lock className="w-4 h-4 text-[#222222]/30 dark:text-[#F5E6D0]/30 flex-shrink-0 mt-0.5" />
        )}
      </div>

      {/* Código de invitación (solo proyectos compartidos) */}
      {tipo === 'compartido' && codigo_invitacion && (
        <div className="flex items-center justify-between bg-[#FFE9CE] dark:bg-[#332E28] rounded-xl px-3 py-2 border-2 border-[#222222] dark:border-[#F5E6D0]">
          <div>
            <p className="text-[#222222]/50 dark:text-[#F5E6D0]/50 text-[10px] font-black uppercase tracking-wide">Código de invitación</p>
            <p className="text-[#222222] dark:text-[#F5E6D0] font-mono font-black tracking-widest text-sm">{codigo_invitacion}</p>
          </div>
          <button
            onClick={copiarCodigo}
            className="text-[#222222]/50 dark:text-[#F5E6D0]/50 hover:text-[#222222] dark:hover:text-[#F5E6D0] transition-colors p-1"
            title="Copiar código"
          >
            {copiado ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Miembros (solo compartidos) */}
      {tipo === 'compartido' && miembros.length > 0 && (
        <div className="space-y-1">
          <p className="text-[#222222]/50 dark:text-[#F5E6D0]/50 text-[10px] font-black uppercase tracking-wide">{miembros.length} {miembros.length === 1 ? 'miembro' : 'miembros'}</p>
          <div className="flex flex-wrap gap-1">
            {miembros.map(m => (
              <span key={m.user_id} className="text-xs bg-[#FFE9CE] dark:bg-[#332E28] text-[#222222] dark:text-[#F5E6D0] border-2 border-[#222222] dark:border-[#F5E6D0] rounded-full px-2 py-0.5 font-bold">
                {m.perfiles?.nombre ?? m.perfiles?.email ?? 'Desconocido'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Botón ver movimientos */}
      <Link
        href={`/proyectos/${id}`}
        className="flex items-center justify-between w-full bg-[#222222] hover:bg-[#000000] text-[#FFD80B] rounded-xl px-4 py-2.5 transition-colors text-sm font-black border-2 border-[#222222]"
      >
        <span>Ver movimientos</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}
