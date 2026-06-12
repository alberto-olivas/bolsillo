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
- `proxy.ts` — protección de rutas
- `lib/supabase/client.ts` — cliente Supabase para el navegador
- `lib/supabase/server.ts` — cliente Supabase para el servidor (SSR)
- `app/layout.tsx` — root layout con fuente Geist y metadata en español
- `app/page.tsx` — redirect de "/" a "/home"
- `app/globals.css` — dark theme base (neutral-950)
- `app/(auth)/layout.tsx` — layout centrado para login/register
- `app/(auth)/login/page.tsx` — pantalla de login
- `app/(auth)/register/page.tsx` — pantalla de registro
- `app/(protected)/layout.tsx` — layout wrapper para rutas protegidas
- `app/(protected)/home/page.tsx` — redirige a /mis-proyectos
- `components/auth/LoginForm.tsx` — formulario de login (Client Component)
- `components/auth/RegisterForm.tsx` — formulario de registro (Client Component)
- `components/auth/LogoutButton.tsx` — botón de cierre de sesión (Client Component)
- `.env.local` — credenciales de Supabase (nunca commitear)

**Decisiones técnicas:**
- Framework: Next.js 16 (App Router)
- Auth: Supabase Auth con email/contraseña
- Sesión: manejada por `@supabase/ssr` vía cookies HTTP-only
- Protección: `proxy.ts` (equivalente al antiguo `middleware.ts` en Next.js 16)
- Paleta: neutral-950 fondo, neutral-900 cards, indigo-600 accent

---

### FASE 2 — Base de datos en Supabase ✓ (completada y verificada 2026-06-12)

**Qué se hizo:**
- Esquema completo ejecutado en Supabase (`supabase/fase2_schema.sql`)
- 7 tablas con RLS, triggers y funciones helper
- Verificado con dos cuentas reales: aislamiento RLS correcto

**Tablas:**
- `perfiles` — espejo de auth.users, `nombre` nullable (null = perfil incompleto)
- `proyectos` — con código de invitación auto-generado (trigger)
- `miembros_proyecto` — pivote usuario↔proyecto; base de toda la seguridad RLS
- `categorias` — 8 predefinidas insertadas automáticamente al crear proyecto
- `gastos_fijos` — plantillas de recurrentes
- `movimientos` — cada gasto/ingreso
- `pendientes_confirmar` — cola mensual de gastos fijos a revisar

**Checklist de verificación:**
- [x] 7 tablas visibles en Table Editor
- [x] Trigger crea perfil al registrarse
- [x] Trigger añade código al proyecto compartido
- [x] Trigger añade creador como miembro
- [x] Trigger inserta 8 categorías al crear proyecto
- [x] RLS: usuario_a no ve datos de usuario_b
- [x] RLS: ambos usuarios ven proyecto compartido tras unirse con código

---

### FASE 3 — Gestión de Proyectos ✓ (implementada 2026-06-12)

**Qué se hizo:**
- Gate de perfil: si `nombre IS NULL` → redirige a `/completar-perfil` antes de entrar
- Pantalla "Mis proyectos": lista de proyectos, crear y unirse con código
- Función `unirse_proyecto()` SECURITY DEFINER en Supabase (bypasea RLS para join)

**SQL ejecutado en Supabase** (`supabase/fase3_rpc.sql` ✓):
  - Datos de prueba de Fase 2 eliminados
  - Función `unirse_proyecto(p_codigo text)` creada

**Archivos creados/modificados:**
- `proxy.ts` — añadidas `/mis-proyectos` y `/completar-perfil` a rutas protegidas
- `app/(protected)/layout.tsx` — comprueba `nombre IS NULL` → redirect `/completar-perfil`
- `app/(protected)/home/page.tsx` — simplificado: redirige a `/mis-proyectos`
- `app/(onboarding)/layout.tsx` — layout mínimo (auth sí, perfil no → evita bucle)
- `app/(onboarding)/completar-perfil/page.tsx` — pantalla para poner el nombre
- `app/(protected)/mis-proyectos/page.tsx` — lista + crear + unirse
- `components/perfil/CompletarPerfilForm.tsx` — formulario del nombre
- `components/proyectos/ProyectoCard.tsx` — card con código copiable y miembros
- `components/proyectos/CrearProyectoForm.tsx` — crear proyecto personal o compartido
- `components/proyectos/UnirseConCodigoForm.tsx` — input de 6 chars + llamada RPC

**Decisiones técnicas:**
- Gate de perfil en layout, no en proxy.ts: el proxy solo sabe de auth, no de datos
- Grupo `(onboarding)` separado de `(protected)` para evitar bucle de redirect
- `unirse_proyecto()` como RPC SECURITY DEFINER: la única forma de encontrar un proyecto sin ser miembro
- Cookie `proyecto_activo_id`: se implementará en Fase 4 cuando haya pantalla de gastos

**Flujo completo:**
```
Registro → /completar-perfil (nombre) → /mis-proyectos
                                              ├─ Crear proyecto personal
                                              ├─ Crear proyecto compartido (con código)
                                              └─ Unirme con código de invitación
```

**Checklist de verificación:**
- [x] Ejecutar `supabase/fase3_rpc.sql` en Supabase SQL Editor
- [ ] Registrar cuenta nueva → redirige a `/completar-perfil`
- [ ] Rellenar nombre → redirige a `/mis-proyectos`
- [ ] Cuenta con nombre ya rellenado → entra directamente a `/mis-proyectos`
- [ ] Crear proyecto personal → aparece en la lista
- [ ] Crear proyecto compartido → aparece con código de 6 chars
- [ ] Desde cuenta B: unirse con ese código → aparece el proyecto compartido
- [ ] Verificar en Table Editor: ambos en `miembros_proyecto` del proyecto compartido

---

## ⚠️ ANTES DE ARRANCAR: pasos manuales necesarios

### 1. Arrancar la app
```bash
cd "c:\Users\silav\Desktop\APPS\BOLSILLO\VS CODE\bolsillo"
npm run dev
```
Abrir en el navegador: `http://localhost:3000`

---

## Próximo paso

**FASE 4 — Registro de movimientos**
- Pantalla para añadir gastos/ingresos dentro de un proyecto
- Selector de categoría
- Listado de movimientos del mes
- Selector de proyecto activo en la cabecera (cookie `proyecto_activo_id`)
