import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bolsillo — Control de gastos',
    short_name: 'Bolsillo',
    description: 'App de control de gastos e ingresos personales y compartidos',
    start_url: '/mis-proyectos',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    orientation: 'portrait',
    icons: [
      {
        src: '/logo-bolsillo.png',
        sizes: 'any',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  }
}
