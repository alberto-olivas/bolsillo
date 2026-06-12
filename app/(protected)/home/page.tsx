import { redirect } from 'next/navigation'

// /home ahora redirige directamente a /mis-proyectos.
// En Fase 8 se convertirá en el dashboard principal.
export default function HomePage() {
  redirect('/mis-proyectos')
}
