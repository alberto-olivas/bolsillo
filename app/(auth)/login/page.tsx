import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Bolsillo</h1>
        <p className="text-neutral-400 text-sm">Controla tus gastos con facilidad</p>
      </div>

      <div className="bg-neutral-900 rounded-2xl p-6 shadow-xl border border-neutral-800">
        <h2 className="text-xl font-semibold text-white mb-6">Iniciar sesión</h2>
        <LoginForm />
      </div>
    </>
  )
}
