'use client';

import { useEffect } from 'react';

// Registra o service worker no cliente (necessário para instalar o PWA).
export function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* falha silenciosa: não bloqueia o app */
      });
    }
  }, []);
  return null;
}
