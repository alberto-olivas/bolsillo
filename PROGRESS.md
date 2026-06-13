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

### FASE 3 — Gestión de Proyectos ✓ (completada y verificada 2026-06-13)

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
- Server Actions sin `revalidatePath`: en Next.js 16 + React 19 `revalidatePath` bloquea la respuesta al cliente y el `await` del Server Action nunca resuelve; se usa `window.location.reload()` en su lugar
- Foreign key `miembros_proyecto.user_id → perfiles.id` necesaria en Supabase para que PostgREST pueda hacer el join anidado en la query de proyectos

**SQL adicional ejecutado en Supabase:**
```sql
ALTER TABLE public.miembros_proyecto
  ADD CONSTRAINT fk_miembros_proyecto_perfiles
  FOREIGN KEY (user_id) REFERENCES public.perfiles(id);
```

**Flujo completo:**
```
Registro → /completar-perfil (nombre) → /mis-proyectos
                                              ├─ Crear proyecto personal
                                              ├─ Crear proyecto compartido (con código)
                                              └─ Unirme con código de invitación
```

**Checklist de verificación:**
- [x] Ejecutar `supabase/fase3_rpc.sql` en Supabase SQL Editor
- [x] Foreign key `miembros_proyecto → perfiles` añadida en Supabase
- [x] Registrar cuenta nueva → redirige a `/completar-perfil`
- [x] Rellenar nombre → redirige a `/mis-proyectos`
- [x] Cuenta con nombre ya rellenado → entra directamente a `/mis-proyectos`
- [x] Crear proyecto personal → aparece en la lista
- [x] Crear proyecto compartido → aparece con código de 6 chars
- [x] Desde cuenta B: unirse con ese código → aparece el proyecto compartido
- [x] Verificar en Table Editor: ambos en `miembros_proyecto` del proyecto compartido

---

### FASE 4 — Registro de Movimientos ✓ (completada 2026-06-13)

**Qué se hizo:**
- Página `/proyectos/[id]`: detalle de proyecto con lista de movimientos del mes
- Botón "Ver movimientos →" en cada ProyectoCard
- Resumen del mes: totales de gastos, ingresos y saldo
- Formulario "Nuevo movimiento": tipo (gasto/ingreso), cantidad, categoría con icono y color, fecha, descripción opcional
- Lista de movimientos con icono de categoría, descripción, fecha y quién lo añadió
- Server Action `crearMovimiento()` en `app/actions/movimientos.ts`
- Mapeo de iconos lucide-react en `lib/iconos-categorias.ts`

**Archivos creados/modificados:**
- `proxy.ts` — añadida `/proyectos` a rutas protegidas
- `app/(protected)/proyectos/[id]/page.tsx` — página de detalle del proyecto
- `app/actions/movimientos.ts` — Server Action crearMovimiento()
- `components/movimientos/NuevoMovimientoForm.tsx` — formulario (Client Component)
- `components/movimientos/MovimientoItem.tsx` — fila de un movimiento
- `components/movimientos/ResumenMes.tsx` — totales del mes
- `components/proyectos/ProyectoCard.tsx` — añadido botón "Ver movimientos →"
- `lib/iconos-categorias.ts` — mapeo nombre→componente lucide-react

**SQL ejecutado en Supabase:**
```sql
ALTER TABLE public.movimientos
  ADD CONSTRAINT fk_movimientos_perfiles
  FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id);
```

**Checklist de verificación:**
- [x] Botón "Ver movimientos →" en cada ProyectoCard navega a `/proyectos/[id]`
- [x] Formulario muestra categorías filtradas por tipo (gasto/ingreso)
- [x] Guardar movimiento → aparece en la lista
- [x] Totales del resumen se actualizan correctamente
- [x] FK `movimientos.usuario_id → perfiles.id` añadida en Supabase

**Funcionalidades aplazadas (pasan a Fase 5):**
- Editar movimiento
- Eliminar movimiento
- Selector de proyecto activo en cabecera (cookie `proyecto_activo_id`)

---

### FASE 5 — Gestión avanzada de movimientos 🚧 (en progreso)

**Bloque A — CRUD completo de movimientos ✓**
- [x] Editar movimiento: cantidad, categoría, fecha, descripción (formulario inline)
- [x] Eliminar movimiento (confirmación antes de borrar)

**Bloque B — Movimientos recurrentes ✓**
- [x] Toggle "Se repite cada mes" en crear y editar → inserta en `gastos_fijos`
- [x] Desactivar toggle en edición → `gastos_fijos.activo = false`
- [x] Badge "· Fijo" visible en la lista de movimientos
- [x] Al editar un fijo: actualiza también `gastos_fijos` (cantidad, categoría, día)

**Bloque C — Pendientes de confirmar (lógica mensual) ✓**
- [x] Al cargar la página: upsert idempotente en `pendientes_confirmar` por cada `gasto_fijo` activo del mes actual (`onConflict: 'gasto_fijo_id,mes_ano'`)
- [x] UI de revisión: sección "Pendientes de confirmar" entre ResumenMes y NuevoMovimientoForm
- [x] Botón "Confirmar" → crea movimiento con fecha calculada + marca `confirmado`
- [x] Botón "Descartar" → marca `descartado`; sección desaparece cuando no quedan pendientes

**Archivos creados/modificados (Bloques A, B y C):**
- `app/actions/movimientos.ts` — añadidos `editarMovimiento()` y `eliminarMovimiento()`; `crearMovimiento()` y `editarMovimiento()` soportan `esFijo` y `diaDelMes`
- `app/actions/pendientes.ts` — Server Actions `confirmarPendiente()` y `descartarPendiente()`
- `components/movimientos/MovimientoItem.tsx` — convertido a Client Component con edición inline, confirmación de borrado y toggle de gasto fijo
- `components/movimientos/NuevoMovimientoForm.tsx` — añadido toggle "Se repite cada mes" + campo día del mes
- `components/movimientos/PendientesConfirmar.tsx` — lista de pendientes con botones confirmar/descartar
- `app/(protected)/proyectos/[id]/page.tsx` — query ampliada con `es_fijo`, `gasto_fijo_id`, join `gastos_fijos`; generación de pendientes; render de `PendientesConfirmar`

---

## ⚠️ ANTES DE ARRANCAR: pasos manuales necesarios

### 1. Arrancar la app
```bash
cd "c:\Users\silav\Desktop\APPS\BOLSILLO\VS CODE\bolsillo"
npm run dev
```
Abrir en el navegador: `http://localhost:3000`

---

---

### FASE 6 — Vista general (extracto bancario) ✓ (completada 2026-06-13)

**Qué se hizo:**
- Selector de mes ← → en la lista de movimientos (navega via `?mes=YYYY-MM` en la URL)
- Movimientos agrupados por día con total neto de cada día (coloreado verde/rojo)
- "Hoy" / "Ayer" para fechas recientes; formato largo para el resto
- Filtro por tipo (Todos / Gastos / Ingresos) — estado cliente, sin re-fetch
- Filtro por categoría (pills scrollables horizontalmente) — estado cliente
- Resumen del mes rediseñado: saldo destacado en grande + chips Gastos/Ingresos
- Rango de fechas del mes correcto (primerDia → ultimoDia) incluyendo el último día

**Archivos creados/modificados:**
- `components/movimientos/ListaMovimientos.tsx` — Client Component con mes nav, filtros y agrupación por día
- `components/movimientos/ResumenMes.tsx` — rediseño visual (saldo grande + 2 chips)
- `app/(protected)/proyectos/[id]/page.tsx` — añadido `searchParams`, rango de fechas parametrizado, render de `ListaMovimientos`
- `components/movimientos/NuevoMovimientoForm.tsx` — fecha por defecto inteligente: hoy si es el mes actual, último día si es mes pasado, primer día si es mes futuro

---

## Pendientes futuros (fuera de MVP actual)

- **Modo claro/oscuro intercambiable**: tokens de color, toggle de tema, persistencia de preferencia. Requiere tocar retroactivamente todos los componentes de Fases 1-6. Tratar como mini-fase independiente.
- **Gráfico de barras semanal** (Fase 8): visión general de gastos por semana.

---

---

### FASE 7 — Vista de categorías (donut + listado) ✓ (completada 2026-06-13)

**Qué se hizo:**
- Nueva ruta `/proyectos/[id]/categorias` con donut SVG (sin dependencias externas) + lista de categorías
- Donut muestra solo gastos del mes; segmentos coloreados con el color de cada categoría
- Todas las categorías de gasto aparecen en la lista (incluso con 0€), ordenadas por importe desc
- Categorías con 0€ aparecen atenuadas y no son clicables
- Selector de mes ← → sincronizado con la vista de movimientos (mismo `?mes=YYYY-MM`)
- Al pulsar una categoría → navega a `/proyectos/[id]?mes=X&cat=uuid` con el filtro pre-aplicado
- Icono de categorías (ChartPie) en la cabecera de la vista de movimientos

**Archivos creados/modificados:**
- `app/(protected)/proyectos/[id]/categorias/page.tsx` — Server Component: fetch + merge categorías/totales
- `components/categorias/DonutCategorias.tsx` — SVG donut sin librerías externas
- `components/categorias/ListaCategorias.tsx` — lista clicable con barra de progreso
- `app/(protected)/proyectos/[id]/page.tsx` — añadido icono ChartPie, lectura de `?cat=` searchParam
- `components/movimientos/ListaMovimientos.tsx` — prop `initialCat` para pre-seleccionar filtro

---

## Pendientes futuros (fuera de MVP actual)

- **Modo claro/oscuro intercambiable**: tokens de color, toggle de tema, persistencia de preferencia. Requiere tocar retroactivamente todos los componentes de Fases 1-7. Tratar como mini-fase independiente.
- **Gráfico de barras semanal** (Fase 8): visión general de gastos por semana.

---

---

### FASE 8 — Home / Dashboard + Bottom Nav ✓ (completada 2026-06-13)

**Qué se hizo:**
- Bottom navigation fijo en todas las páginas bajo `/proyectos/[id]/*` (Movimientos | Categorías), con icono activo en indigo-400 y preservación del `?mes=` al cambiar de sección
- Selector de proyecto en la cabecera: dropdown con todos los proyectos del usuario, navega preservando el mes. Si solo hay un proyecto, no muestra chevron
- Mini donut de categorías en la vista principal (entre ResumenMes y pendientes), con enlace "Ver todas las categorías →"
- `DonutCategorias` acepta prop `className` para controlar el tamaño desde fuera
- ArrowLeft de categorías redirige a `/mis-proyectos` (consistente con la vista de movimientos)

**Archivos creados/modificados:**
- `components/nav/BottomNav.tsx` — Client Component con usePathname + useSearchParams; Suspense en layout
- `app/(protected)/proyectos/[id]/layout.tsx` — layout que envuelve ambas vistas con BottomNav
- `components/proyectos/SelectorProyecto.tsx` — dropdown de cambio de proyecto
- `components/categorias/DonutCategorias.tsx` — prop `className` añadida
- `app/(protected)/proyectos/[id]/page.tsx` — query todos los proyectos, cálculo mini donut, SelectorProyecto, mini DonutCategorias
- `app/(protected)/proyectos/[id]/categorias/page.tsx` — pb-24, ArrowLeft → /mis-proyectos

---

---

### MINI-FASE — Modo claro/oscuro ✓ (completada 2026-06-13)

**Qué se hizo:**
- Instalado `next-themes`; `ThemeProvider` envuelve la app en `app/providers.tsx`
- `suppressHydrationWarning` en `<html>` para evitar flash de hidratación
- Tailwind v4: `@custom-variant dark (&:where(.dark, .dark *));` en `globals.css` para modo clase (no media query)
- `ThemeToggle` (sol/luna) añadido al BottomNav y a la cabecera de `/mis-proyectos`
- Preferencia persistida en `localStorage` automáticamente vía `next-themes`
- Mapa de equivalencias aplicado a los ~20 archivos con clases hard-codeadas en dark
- Iconos de categoría: opacidad del fondo pasó de `'20'` (12.5%) a `'33'` (20%) para visibilidad en modo claro
- SVG del donut: migrado de atributos `fill`/`stroke` hardcodeados a `className="fill-..."` de Tailwind

**Archivos creados:**
- `app/providers.tsx` — ThemeProvider
- `components/ui/ThemeToggle.tsx` — toggle sol/luna con check de `mounted`

**Archivos modificados (todos los componentes y páginas):**
- `app/globals.css`, `app/layout.tsx`
- `app/(auth)/layout.tsx`, `app/(onboarding)/layout.tsx`
- `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`
- `app/(onboarding)/completar-perfil/page.tsx`
- `app/(protected)/mis-proyectos/page.tsx`
- `app/(protected)/proyectos/[id]/page.tsx`
- `app/(protected)/proyectos/[id]/categorias/page.tsx`
- `components/auth/LoginForm.tsx`, `components/auth/RegisterForm.tsx`, `components/auth/LogoutButton.tsx`
- `components/perfil/CompletarPerfilForm.tsx`
- `components/proyectos/ProyectoCard.tsx`, `components/proyectos/CrearProyectoForm.tsx`, `components/proyectos/UnirseConCodigoForm.tsx`, `components/proyectos/SelectorProyecto.tsx`
- `components/movimientos/ResumenMes.tsx`, `components/movimientos/NuevoMovimientoForm.tsx`, `components/movimientos/MovimientoItem.tsx`, `components/movimientos/ListaMovimientos.tsx`, `components/movimientos/PendientesConfirmar.tsx`
- `components/categorias/DonutCategorias.tsx`, `components/categorias/ListaCategorias.tsx`
- `components/nav/BottomNav.tsx`

---

---

### FASE 9 — Nuevas categorías + Donut de balance ✓ (completada 2026-06-13)

**Qué se hizo:**
- Dos categorías nuevas predefinidas: Ahorro (PiggyBank, #10b981) y Inversión (TrendingUp, #8b5cf6)
- Trigger de nuevos proyectos actualizado para incluir las 10 categorías
- SQL idempotente para añadir Ahorro e Inversión a los proyectos existentes (`WHERE NOT EXISTS`)
- Nuevo donut "Ingresos vs gastos": dos segmentos (rojo=gastos, verde=restante), muestra saldo, mensaje dinámico (% gastado / exceso / sin ingresos)
- Carrusel horizontal con scroll-snap nativo (sin dependencias): un donut visible a la vez, deslizando o pulsando puntos se pasa al otro. Título del `<h2>` cambia dinámicamente según el slide activo.

**Archivos creados:**
- `components/categorias/DonutBalanceMes.tsx` — donut de balance ingresos/gastos
- `components/categorias/DonutCarousel.tsx` — carrusel con scroll-snap, puntos navegables, título dinámico
- `supabase/fase9_categorias.sql` — SQL idempotente para nuevas categorías + trigger actualizado

**Archivos modificados:**
- `lib/iconos-categorias.ts` — PiggyBank y TrendingUp añadidos
- `app/(protected)/proyectos/[id]/categorias/page.tsx` — query ampliada a todos los tipos de movimiento, cálculo de totalIngresos, DonutCarousel en lugar de los dos donuts apilados

**SQL a ejecutar en Supabase** (`supabase/fase9_categorias.sql`):
- Actualiza el trigger `handle_new_proyecto_categorias` para incluir Ahorro e Inversión
- Inserta Ahorro e Inversión en todos los proyectos existentes (idempotente)

---

---

### FASE 10 — Pantalla de Ajustes ✓ (completada 2026-06-13)

**Qué se hizo:**
- Nueva ruta `/ajustes` con 5 secciones: Cuenta, Perfil, Apariencia, Aplicación, Sesión
- Editar nombre: Server Action `editarNombre()` + Client Component `EditarNombreForm`, mismo patrón que el resto de la app (`window.location.reload()`)
- ThemeToggle consolidado en /ajustes (eliminado de BottomNav y cabecera de mis-proyectos)
- LogoutButton movido a /ajustes (eliminado de cabecera de mis-proyectos)
- Sección "Instalar app" como placeholder desactivado con badge "Próximamente" (para Fase 11 PWA)
- BottomNav: icono Settings (engranaje) como tercer item; cabecera de mis-proyectos: icono engranaje enlazando a /ajustes
- Botón `←` en /ajustes enlaza siempre a /mis-proyectos (no `router.back()` para evitar comportamiento impredecible)

**Archivos creados:**
- `app/(protected)/ajustes/page.tsx` — Server Component con fetch de perfil y email
- `app/actions/perfil.ts` — Server Action `editarNombre()`
- `components/ajustes/EditarNombreForm.tsx` — formulario de edición de nombre

**Archivos modificados:**
- `components/nav/BottomNav.tsx` — ThemeToggle eliminado, icono Settings añadido
- `app/(protected)/mis-proyectos/page.tsx` — ThemeToggle y LogoutButton eliminados, icono engranaje añadido

---

## Pendientes futuros (fuera de MVP actual)

- **Fase 11 — PWA**: botón "Instalar app" ya tiene placeholder en /ajustes.
- **Gráfico de barras semanal**: visión general de gastos por semana.
- **Sistema de presupuestos por categoría**.
