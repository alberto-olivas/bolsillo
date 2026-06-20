// proxy.ts garantiza que solo usuarios autenticados llegan aquí.
// El check de perfil completo ocurre en cada página que lo necesita.
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
