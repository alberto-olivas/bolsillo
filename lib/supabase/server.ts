import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'

// Cliente Supabase para usar en Server Components y Route Handlers
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Los Server Components no pueden setear cookies directamente.
            // El proxy.ts se encarga de refrescar las cookies de sesión.
          }
        },
      },
      // Next.js 16 cachea las llamadas fetch() del cliente de Supabase en su
      // Data Cache. Con no-store forzamos que cada consulta vaya a Supabase
      // directamente, sin datos obsoletos al hacer router.refresh().
      global: {
        fetch: (url: RequestInfo | URL, options: RequestInit = {}) =>
          fetch(url, { ...options, cache: 'no-store' }),
      },
    }
  )
}

// React.cache() deduplica getUser() dentro del mismo render de servidor.
// El layout y la página comparten un solo request de red a Supabase Auth
// en lugar de hacer dos llamadas independientes por navegación.
export const getCachedUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})
