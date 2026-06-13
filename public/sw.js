// ⚠️ Incrementar este número en cada deploy importante para forzar
// actualización del cache en todos los usuarios. Ejemplo: 'bolsillo-v2', 'bolsillo-v3'...
const CACHE = 'bolsillo-v1'

// Solo cacheamos assets estáticos de Next.js: son content-addressed (hash en el nombre),
// por lo que es imposible que queden desfasados aunque no incrementemos la versión.
const STATIC_PATTERNS = ['/_next/static/']

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', event => {
  // Borrar caches de versiones anteriores al activar la nueva versión del SW
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = request.url

  // No interceptar llamadas a Supabase ni URLs no-HTTP
  if (url.includes('supabase.co') || !url.startsWith('http')) return

  // Cache-first para assets estáticos de Next.js (seguros por ser content-addressed)
  if (STATIC_PATTERNS.some(p => url.includes(p))) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached
        return fetch(request).then(response => {
          const clone = response.clone()
          caches.open(CACHE).then(c => c.put(request, clone))
          return response
        })
      })
    )
  }
  // Todo lo demás (páginas, rutas de API): red normal, sin interceptar
})
