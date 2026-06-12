// Layout para rutas protegidas.
// La protección real la hace proxy.ts — este layout es solo un wrapper estructural.
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
