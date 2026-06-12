# PROGRESS — App de Gastos (Bolsillo)

## Fases completadas

### FASE 1 — Setup del Proyecto ✓ (completada 2026-06-12)

**Qué se hizo:**
- Proyecto Next.js 16 (App Router) + TypeScript + Tailwind CSS creado en `/bolsillo`
- Instaladas dependencias de Supabase: `@supabase/supabase-js` y `@supabase/ssr`
- Autenticación con Supabase Auth (email + contraseña) implementada
- Pantallas creadas: Login (`/login`), Registro (`/register`), Home protegida (`/home`)
- Protección de rutas con `proxy.ts` (en Next.js 16, `middleware.ts` fue renombrado a `proxy.ts`)
- Diseño visual: dark theme, paleta neutral-950 fondo + indigo-600 accent

**Archivos creados/modificados:**
- `proxy.ts` — protección de rutas (intercepta /home sin sesión → /login, y /login con sesión → /home)
- `lib/supabase/client.ts` — cliente Supabase para el navegador
- `lib/supabase/server.ts` — cliente Supabase para el servidor (SSR)
- `app/layout.tsx` — root layout con fuente Geist y metadata en español
- `app/page.tsx` — redirect de "/" a "/home"
- `app/globals.css` — dark theme base (neutral-950)
- `app/(auth)/layout.tsx` — layout centrado para login/register
- `app/(auth)/login/page.tsx` — pantalla de login
- `app/(auth)/register/page.tsx` — pantalla de registro
- `app/(protected)/layout.tsx` — layout wrapper para rutas protegidas
- `app/(protected)/home/page.tsx` — pantalla home (Server Component, verifica sesión)
- `components/auth/LoginForm.tsx` — formulario de login (Client Component)
- `components/auth/RegisterForm.tsx` — formulario de registro (Client Component)
- `components/auth/LogoutButton.tsx` — botón de cierre de sesión (Client Component)
- `.env.local` — credenciales de Supabase (rellenar con los valores reales)

**Decisiones técnicas:**
- Framework: Next.js 16 (App Router) — última versión estable
- Auth: Supabase Auth con email/contraseña
- Sesión: manejada por `@supabase/ssr` vía cookies HTTP-only (más seguro que localStorage)
- Protección: `proxy.ts` (equivalente al antiguo `middleware.ts` en Next.js 16)
- Paleta: neutral-950 fondo, neutral-900 cards, indigo-600 accent
- Formularios: Client Components con estado local (sin Server Actions — más simple para este nivel)

---

## ⚠️ ANTES DE ARRANCAR: pasos manuales necesarios

### 1. Configurar Supabase
1. Ve a [supabase.com](https://supabase.com) y crea un proyecto (gratis)
2. En el dashboard: **Settings → API**
3. Copia la **Project URL** y la **anon (public) key**
4. Pégalos en `.env.local` (reemplaza `TU_URL_AQUI` y `TU_ANON_KEY_AQUI`)

### 2. Configurar Auth en Supabase
En el dashboard: **Authentication → Settings**
- **Email confirmations → desactivar** (para desarrollo, así no tienes que verificar email cada vez)
- **Site URL** → `http://localhost:3000`
- **Redirect URLs** → añadir `http://localhost:3000/**`

### 3. Arrancar la app
```bash
cd "c:\Users\silav\Desktop\APPS\BOLSILLO\VS CODE\bolsillo"
npm run dev
```
Abrir en el navegador: `http://localhost:3000`

---

## Checklist de verificación (Fase 1)

- [x] `/` redirige automáticamente a `/login` (sin sesión)
- [x] `/home` directo → redirige a `/login`
- [x] Registro funciona → redirige a `/home` con email visible
- [x] Logout → redirige a `/login`
- [x] Login funciona → accede a `/home` correctamente
- [x] Con sesión activa, ir a `/login` → redirige a `/home`

---

## Próximo paso

**FASE 2 — Estructura de base de datos en Supabase**
- Crear tablas: `proyectos`, `miembros_proyecto`, `categorias`, `movimientos`, `gastos_fijos`, `pendientes_confirmar`
- Configurar políticas RLS (Row Level Security)
- Insertar categorías predefinidas por defecto
