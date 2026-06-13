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
        <h2 className="text-neutral-500 dark:text-neutral-400 text-xs font-medium uppercase tracking-wider">
          Aplicación
        </h2>
        <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl px-4 py-3 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {estado === 'instalada'
              ? <CheckCircle className="w-5 h-5 text-green-500" />
              : <Download className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
            }
            <p className="text-sm text-neutral-900 dark:text-white">Instalar app</p>
          </div>

          {estado === 'instalada' && (
            <span className="text-xs text-green-500 font-medium">Instalada ✓</span>
          )}
          {estado === 'instalable' && (
            <button
              onClick={handleInstalar}
              className="text-sm font-medium text-indigo-500 hover:text-indigo-400 transition-colors"
            >
              Instalar
            </button>
          )}
          {(estado === 'ios' || estado === 'manual') && (
            <button
              onClick={() => setModalAbierto(true)}
              className="text-sm font-medium text-indigo-500 hover:text-indigo-400 transition-colors"
            >
              Cómo instalar
            </button>
          )}
        </div>
      </div>

      {modalAbierto && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60"
          onClick={() => setModalAbierto(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-t-3xl p-6 pb-10 space-y-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full mx-auto" />

            <h3 className="text-base font-semibold text-neutral-900 dark:text-white text-center">
              Añadir a la pantalla de inicio
            </h3>

            {esIOS ? (
              <ol className="space-y-4 text-sm text-neutral-700 dark:text-neutral-300">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
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
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span>Desplázate y pulsa <strong>Añadir a pantalla de inicio</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span>Pulsa <strong>Añadir</strong> para confirmar</span>
                </li>
              </ol>
            ) : (
              <ol className="space-y-4 text-sm text-neutral-700 dark:text-neutral-300">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span>Pulsa el menú <strong>⋮</strong> en la esquina superior derecha de Chrome</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span>Selecciona <strong>Añadir a pantalla de inicio</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span>Pulsa <strong>Añadir</strong> para confirmar</span>
                </li>
              </ol>
            )}

            <button
              onClick={() => setModalAbierto(false)}
              className="w-full bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium py-3 rounded-xl text-sm transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  )
}
