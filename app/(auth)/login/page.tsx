import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black text-[#222222] mb-2">Bolsillo</h1>
        <p className="text-[#222222]/50 text-sm font-medium">Controla tus gastos con facilidad</p>
      </div>

      <div className="bg-[#FFF8EC] rounded-2xl p-6 border-2 border-[#222222]" style={{ boxShadow: '6px 6px 0px 0px #222222' }}>
        <h2 className="text-xl font-black text-[#222222] mb-6">Iniciar sesión</h2>
        <LoginForm />
      </div>
    </>
  )
}
