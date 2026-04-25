self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Ativação do Service Worker
});

self.addEventListener('fetch', event => {
  // Pode adicionar lógica de cache aqui se quiser
});