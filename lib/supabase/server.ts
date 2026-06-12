import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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
