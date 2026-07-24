import type { MetadataRoute } from 'next';

// Web App Manifest — torna o TreinaPro instalável na tela inicial (PWA).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TreinaPro',
    short_name: 'TreinaPro',
    description: 'Treinos, avaliações e evolução com seu personal trainer.',
    // Rota que se auto-corrige: sem login vai para /login; se for personal,
    // o layout redireciona para o painel dele.
    start_url: '/aluno/dashboard',
    display: 'standalone',
    background_color: '#0e1626',
    theme_color: '#0e1626',
    orientation: 'portrait',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
