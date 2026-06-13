import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bolsillo — Control de gastos',
    short_name: 'Bolsillo',
    description: 'App de control de gastos e ingresos personales y compartidos',
    start_url: '/mis-proyectos',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#4f46e5',
    orientation: 'portrait',
    icons: [
      {
        src: '/api/pwa-icon?size=192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/api/pwa-icon?size=512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
