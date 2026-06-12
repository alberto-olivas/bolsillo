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

---

### FASE 2 — Base de datos en Supabase (SQL listo, pendiente de ejecutar en Supabase)

**Archivo:** `supabase/fase2_schema.sql` — pegar en Supabase → SQL Editor → Run

**Tablas creadas (7):**
- `perfiles` — sincronizada con auth.users via trigger; `nombre` nullable (null = perfil sin completar)
- `proyectos` — con trigger de código de invitación automático (6 chars, sin 0/O/1/I)
- `miembros_proyecto` — tabla pivote usuario↔proyecto; base de toda la seguridad RLS
- `categorias` — con 8 predefinidas insertadas automáticamente al crear proyecto
- `gastos_fijos` — plantillas de gastos/ingresos recurrentes
- `movimientos` — cada gasto o ingreso registrado
- `pendientes_confirmar` — cola mensual de gastos fijos a revisar

**Decisiones técnicas:**
- RLS: función helper `es_miembro(proyecto_id)` con SECURITY DEFINER evita recursión circular
- Perfil incompleto: se detecta con `nombre IS NULL` (sin boolean extra)
- Flujo de perfil incompleto: `proxy.ts` verifica auth → `(protected)/layout.tsx` verifica `nombre IS NULL` → redirige a `/completar-perfil`
- Trigger para creador: SECURITY DEFINER para poder insertar en `miembros_proyecto` antes de que RLS esté activo
- Índices: `miembros_proyecto(proyecto_id, user_id)`, `movimientos(fecha)`, y todos los `proyecto_id`

**Checklist de verificación (Fase 2):**
- [ ] Ejecutar `supabase/fase2_schema.sql` en Supabase SQL Editor sin errores
- [ ] Verificar que aparecen las 7 tablas en Table Editor
- [ ] Verificar que el perfil del usuario existente se creó en `perfiles`
- [ ] Test A (aislamiento): usuario_b no ve datos de usuario_a
- [ ] Test B (compartido): ambos usuarios ven el mismo proyecto tras unirse con código

---

## Próximo paso

**FASE 3 — Gestión de proyectos**
- Pantalla "Mis proyectos": listado de proyectos del usuario
- Crear proyecto personal o compartido
- Unirse a proyecto con código
- Pantalla "Completar perfil" (nombre obligatorio antes de acceder a la app)
- Selector de proyecto activo en la cabecera
