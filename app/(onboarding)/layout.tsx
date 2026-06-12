// Layout mínimo para rutas de onboarding.
// proxy.ts ya verificó autenticación. Este grupo NO comprueba el perfil,
// lo que permite que /completar-perfil funcione sin bucle infinito.
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      {children}
    </div>
  )
}
