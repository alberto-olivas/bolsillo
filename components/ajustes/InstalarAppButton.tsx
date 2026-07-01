'use client'

import { useEffect, useState } from 'react'
import { Download, CheckCircle } from 'lucide-react'

type Estado = 'instalable' | 'instalada' | 'ios' | 'manual'

export default function InstalarAppButton() {
  const [estado, setEstado] = useState<Estado>('manual')
  const [promptEvent, setPromptEvent] = useState<any>(null)
  const [modalAbierto, setModalAbierto] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true) {
      setEstado('instalada')
      return
    }
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      setEstado('ios')
      return
    }
    const handler = (e: Event) => {
      e.preventDefault()
      setPromptEvent(e)
      setEstado('instalable')
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstalar() {
    if (!promptEvent) return
    promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice
    if (outcome === 'accepted') setEstado('instalada')
  }

  const esIOS = estado === 'ios'

  return (
    <>
      <div className="space-y-2">
        <h2 className="text-[#222222]/50 text-[10px] font-black uppercase tracking-widest">
          Aplicación
        </h2>
        <div className="bg-[#FFF8EC] rounded-2xl px-4 py-3 border-2 border-[#222222] flex items-center justify-between" style={{ boxShadow: '4px 4px 0px 0px #222222' }}>
          <div className="flex items-center gap-3">
            {estado === 'instalada'
              ? <CheckCircle className="w-5 h-5 text-green-500" />
              : <Download className="w-5 h-5 text-[#222222]/50" />
            }
            <p className="text-sm text-[#222222] font-black">Instalar app</p>
          </div>

          {estado === 'instalada' && (
            <span className="text-xs text-[#2FA84F] font-black">Instalada ✓</span>
          )}
          {estado === 'instalable' && (
            <button
              onClick={handleInstalar}
              className="text-sm font-black text-[#8B53FF] hover:text-[#6B33D9] transition-colors"
            >
              Instalar
            </button>
          )}
          {(estado === 'ios' || estado === 'manual') && (
            <button
              onClick={() => setModalAbierto(true)}
              className="text-sm font-black text-[#8B53FF] hover:text-[#6B33D9] transition-colors"
            >
              Cómo instalar
            </button>
          )}
        </div>
      </div>

      {modalAbierto && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-[#222222]/60"
          onClick={() => setModalAbierto(false)}
        >
          <div
            className="w-full max-w-sm bg-[#FFF8EC] rounded-t-3xl p-6 pb-10 space-y-5 border-t-2 border-x-2 border-[#222222]"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#222222]/20 rounded-full mx-auto" />

            <h3 className="text-base font-black text-[#222222] text-center">
              Añadir a la pantalla de inicio
            </h3>

            {esIOS ? (
              <ol className="space-y-4 text-sm text-[#222222]/70">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#222222] text-[#FFD80B] rounded-full flex items-center justify-center text-xs font-black">1</span>
                  <span>
                    Pulsa el botón <strong>Compartir</strong>{' '}
                    <svg viewBox="0 0 24 24" className="inline-block w-4 h-4 mb-0.5 align-middle text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="9" width="14" height="12" rx="2" />
                      <path d="M12 2v11" />
                      <path d="M8 6l4-4 4 4" />
                    </svg>{' '}
                    en la barra inferior de Safari
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#222222] text-[#FFD80B] rounded-full flex items-center justify-center text-xs font-black">2</span>
                  <span>Desplázate y pulsa <strong>Añadir a pantalla de inicio</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#222222] text-[#FFD80B] rounded-full flex items-center justify-center text-xs font-black">3</span>
                  <span>Pulsa <strong>Añadir</strong> para confirmar</span>
                </li>
              </ol>
            ) : (
              <ol className="space-y-4 text-sm text-[#222222]/70">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#222222] text-[#FFD80B] rounded-full flex items-center justify-center text-xs font-black">1</span>
                  <span>Pulsa el menú <strong>⋮</strong> en la esquina superior derecha de Chrome</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#222222] text-[#FFD80B] rounded-full flex items-center justify-center text-xs font-black">2</span>
                  <span>Selecciona <strong>Añadir a pantalla de inicio</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#222222] text-[#FFD80B] rounded-full flex items-center justify-center text-xs font-black">3</span>
                  <span>Pulsa <strong>Añadir</strong> para confirmar</span>
                </li>
              </ol>
            )}

            <button
              onClick={() => setModalAbierto(false)}
              className="w-full bg-[#222222] hover:bg-[#000000] text-[#FFD80B] font-black py-3 rounded-xl text-sm transition-colors border-2 border-[#222222]"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  )
}
