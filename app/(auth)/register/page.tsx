import RegisterForm from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[#D85A30] mb-2">Bolsillo</h1>
        <p className="text-neutral-500 text-sm">Controla tus gastos con facilidad</p>
      </div>

      <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl p-6 shadow-xl border border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">Crear cuenta</h2>
        <RegisterForm />
      </div>
    </>
  )
}
