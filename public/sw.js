// Service worker mínimo — habilita a instalação do PWA e recebe push no futuro.
// Passthrough de rede (sem cache agressivo) para não servir versão desatualizada
// de um app com renderização no servidor.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {
  // Deixa o navegador tratar as requisições normalmente.
});

// Recebe uma notificação push e a exibe.
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {};
  }
  const title = data.title || 'TreinaPro';
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: data.url || '/aluno/dashboard' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Ao clicar na notificação, foca uma aba aberta ou abre o app.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/aluno/dashboard';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
