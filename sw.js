/* eslint-disable no-restricted-globals */
/**
 * Todo List PWA service worker. 0.2.227 is replaced at build time.
 */
const CACHE_NAME = 'todolist-0.2.227'

const PRECACHE_URLS = [
  '/',
  '/site.webmanifest',
  '/pwa/icon-192.png',
  '/pwa/icon-512.png',
  '/pwa/icon-512-maskable.png',
]

const STATIC_ASSET_RE =
  /\.(min\.js|min\.css|woff2?|ttf|eot|png|svg|webmanifest|ico)$/i

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
  )
  self.skipWaiting()
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') {
    return
  }

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request))
    return
  }

  if (STATIC_ASSET_RE.test(url.pathname)) {
    event.respondWith(cacheFirstAsset(request))
    return
  }
})

/**
 * @param {Request} request
 */
async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = (await caches.match(request)) || (await caches.match('/'))
    if (cached) {
      return cached
    }
    return new Response('Offline', { status: 503, statusText: 'Offline' })
  }
}

/**
 * @param {Request} request
 */
async function cacheFirstAsset(request) {
  const cached = await caches.match(request)
  if (cached) {
    return cached
  }
  const response = await fetch(request)
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME)
    cache.put(request, response.clone())
  }
  return response
}
