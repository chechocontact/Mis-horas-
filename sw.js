// Service worker de Mis Horass.
// Solo guarda copias de los archivos de la app (página, íconos, librerías) para que abra rápido y sin señal.
// NUNCA intercepta las llamadas de inicio de sesión ni de guardado de turnos (Firebase): esas van
// siempre directo a internet, así que este archivo no puede hacer que se pierdan datos.
const VERSION = 'mishorass-v3';
const SHELL = ['/index.html', '/firebase-config.js', '/manifest.webmanifest',
  '/icon-192.png', '/icon-512.png', '/logo.png', '/favicon-32.png', '/apple-touch-icon.png'];
// Librerías externas que sí se pueden guardar: sus direcciones incluyen la versión y no cambian.
const LIBS = [/^https:\/\/www\.gstatic\.com\/firebasejs\//, /^https:\/\/fonts\.googleapis\.com\//, /^https:\/\/fonts\.gstatic\.com\//];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                 // nada que no sea lectura
  const url = new URL(req.url);

  // Archivos de la propia app: primero internet (siempre la versión nueva); sin señal, la copia guardada.
  if (url.origin === self.location.origin) {
    if (url.pathname === '/sw.js') return;
    e.respondWith(networkFirst(req));
    return;
  }
  // Librerías con versión fija: primero la copia guardada.
  if (LIBS.some(re => re.test(req.url))) {
    e.respondWith(cacheFirst(req));
    return;
  }
  // Todo lo demás (Firebase Auth, Firestore, etc.) pasa directo a internet, sin tocarlo.
});

async function networkFirst(req) {
  const cache = await caches.open(VERSION);
  const url = new URL(req.url); url.hash = '';
  const key = url.pathname === '/' ? '/index.html' : url.href;
  try {
    // Se pide por dirección (no reutilizando la petición original) para poder forzar "sin caché",
    // también en las navegaciones.
    const res = await fetch(url.href, { cache: 'no-store', credentials: 'same-origin' });
    if (res && res.ok) cache.put(key, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(key) || await cache.match(url.href, { ignoreSearch: true }) ||
      (req.mode === 'navigate' ? await cache.match('/index.html') : null);
    if (hit) return hit;
    throw err;
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(VERSION);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
  return res;
}
