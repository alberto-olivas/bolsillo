// Layout compartido para las pantallas de login y registro
// Centra el contenido vertical y horizontalmente en pantalla completa
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAECE7] to-white dark:from-[#1c0a04] dark:to-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {children}
      </div>
    </div>
  )
}
