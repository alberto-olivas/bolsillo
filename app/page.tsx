import { redirect } from 'next/navigation'

// La ruta raíz "/" redirige a /home.
// Si el usuario no tiene sesión, proxy.ts lo capturará y redirigirá a /login.
export default function Page() {
  redirect('/home')
}
