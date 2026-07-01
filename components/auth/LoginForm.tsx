'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }

    router.push('/home')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-[10px] font-black uppercase tracking-wide text-[#222222]/50">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="tu@email.com"
          className="bg-[#FFE9CE] border-2 border-[#222222] rounded-xl px-4 py-3 text-[#222222] placeholder-[#222222]/40 focus:outline-none focus:ring-2 focus:ring-[#FFD80B] transition-colors w-full"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-[10px] font-black uppercase tracking-wide text-[#222222]/50">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="bg-[#FFE9CE] border-2 border-[#222222] rounded-xl px-4 py-3 text-[#222222] placeholder-[#222222]/40 focus:outline-none focus:ring-2 focus:ring-[#FFD80B] transition-colors w-full"
        />
      </div>

      {error && (
        <p className="text-[#FD4C38] text-sm bg-[#FFE2DD] px-3 py-2 rounded-xl border-2 border-[#FD4C38] font-bold">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-[#222222] hover:bg-[#000000] disabled:opacity-50 disabled:cursor-not-allowed text-[#FFD80B] font-black py-3 rounded-xl transition-colors mt-2 w-full border-2 border-[#222222]"
        style={{ boxShadow: '4px 4px 0px 0px rgba(34,34,34,0.2)' }}
      >
        {loading ? 'Entrando...' : 'Iniciar sesión'}
      </button>

      <p className="text-center text-[#222222]/50 text-sm font-medium">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="text-[#8B53FF] font-black hover:underline transition-colors">
          Regístrate
        </Link>
      </p>
    </form>
  )
}
