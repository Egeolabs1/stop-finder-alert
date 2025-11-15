/**
 * Service Worker para cache de assets e funcionalidades offline
 */

const CACHE_NAME = 'sonecaz-v1';
const STATIC_CACHE = 'sonecaz-static-v1';
const DYNAMIC_CACHE = 'sonecaz-dynamic-v1';

// Assets para cache estático
const STATIC_ASSETS = [
  '/',
  '/index.html',
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        // Cachear assets individualmente para evitar falhas se algum não existir
        const cachePromises = STATIC_ASSETS.map((url) => {
          return fetch(url)
            .then((response) => {
              if (response.ok) {
                return cache.put(url, response);
              } else {
                console.warn(`[Service Worker] Failed to cache ${url}: ${response.status}`);
                return Promise.resolve();
              }
            })
            .catch((error) => {
              console.warn(`[Service Worker] Failed to cache ${url}:`, error.message);
              return Promise.resolve(); // Não falhar completamente se um recurso não puder ser cacheado
            });
        });
        
        return Promise.all(cachePromises).then(() => {
          console.log('[Service Worker] Static assets caching completed');
        });
      })
      .catch((error) => {
        console.error('[Service Worker] Error during installation:', error);
        // Continuar mesmo se houver erro
        return Promise.resolve();
      })
  );
  self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== STATIC_CACHE &&
            cacheName !== DYNAMIC_CACHE
          ) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Estratégia: Cache First para assets estáticos, Network First para dados dinâmicos
  if (request.method === 'GET') {
    // Assets estáticos (JS, CSS, imagens)
    if (
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.jpg') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.woff') ||
      url.pathname.endsWith('.woff2')
    ) {
      event.respondWith(cacheFirst(request, STATIC_CACHE));
    }
    // Páginas HTML
    else if (url.pathname.endsWith('.html') || url.pathname === '/') {
      event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    }
    // API calls (Google Maps, etc.)
    else if (url.hostname.includes('googleapis.com') || url.hostname.includes('google.com')) {
      event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    }
    // Outros recursos
    else {
      event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    }
  }
});

// Estratégia: Cache First
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error);
    // Retornar página offline se disponível
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }
    throw error;
  }
}

// Estratégia: Network First
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', error);
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Limpar cache antigo periodicamente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    });
  }
});

