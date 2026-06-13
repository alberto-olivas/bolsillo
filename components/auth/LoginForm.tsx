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
        <label htmlFor="email" className="text-sm text-neutral-600 dark:text-neutral-400">
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
          className="bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg px-4 py-3 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-[#D85A30] transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm text-neutral-600 dark:text-neutral-400">
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
          className="bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg px-4 py-3 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-[#D85A30] transition-colors"
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-[#D85A30] hover:bg-[#c14f28] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors mt-2"
      >
        {loading ? 'Entrando...' : 'Iniciar sesión'}
      </button>

      <p className="text-center text-neutral-500 dark:text-neutral-400 text-sm">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="text-[#D85A30] dark:text-[#e8784a] hover:underline transition-colors">
          Regístrate
        </Link>
      </p>
    </form>
  )
}
