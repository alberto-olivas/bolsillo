import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// proxy.ts es el equivalente a middleware.ts en Next.js 16 (renombrado).
// Se ejecuta antes de que se renderice cualquier página.
export async function proxy(request: NextRequest) {
  // Creamos la respuesta base (dejar pasar la petición)
  let supabaseResponse = NextResponse.next({ request })

  // Creamos el cliente de Supabase para leer/refrescar la sesión desde las cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Cuando Supabase renueva el token, actualizamos las cookies en request y response
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Obtenemos el usuario actual (esto también refresca el token si está próximo a expirar)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAuthRoute = ['/login', '/register'].includes(pathname)
  const isProtectedRoute = pathname.startsWith('/home')

  // Si intenta acceder a una ruta protegida sin sesión → redirige a /login
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si ya tiene sesión e intenta ir a /login o /register → redirige a /home
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  // En todos los demás casos, continuar normalmente (con las cookies actualizadas)
  return supabaseResponse
}

// Le decimos a Next.js en qué rutas debe ejecutarse el proxy
// Excluimos archivos estáticos, imágenes y la API para no ralentizarlos
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
