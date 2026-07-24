// Service worker mínimo — habilita a instalação do PWA e recebe push no futuro.
// Passthrough de rede (sem cache agressivo) para não servir versão desatualizada
// de um app com renderização no servidor.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {
  // Deixa o navegador tratar as requisições normalmente.
});
