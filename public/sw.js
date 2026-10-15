// Service Worker minimo do Service Clinic.
// Objetivo: pagina ja vista continuar abrindo com sinal ruim/sem internet
// (cache de GET same-origin, network-first com fallback pro cache).
// POST (checklist/materiais/assinatura) NAO passa por aqui - e tratado em
// lib/offline-queue.ts (fila em IndexedDB), nao pelo service worker.
const CACHE_NAME = 'service-clinic-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (!req.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((cached) => cached || Response.error()))
  );
});
