'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

// Barra de progresso no topo que aparece assim que o usuário toca num link e
// completa quando a nova rota carrega. Dá feedback imediato de "carregando"
// (importante no app nativo, onde a WebView pode levar um instante).
export function NavProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const timers = useRef<ReturnType<typeof setInterval>[]>([]);

  function clear() {
    timers.current.forEach((t) => clearInterval(t));
    timers.current = [];
  }

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const a = target?.closest?.('a');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || a.target === '_blank' || a.hasAttribute('download')) return;
      let url: URL;
      try {
        url = new URL((a as HTMLAnchorElement).href, location.href);
      } catch {
        return;
      }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname) return; // mesma página
      start();
    }
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function start() {
    clear();
    setVisible(true);
    setWidth(10);
    let w = 10;
    const ramp = setInterval(() => {
      w += (90 - w) * 0.12;
      setWidth(w);
    }, 200);
    // segurança: some sozinho se a rota não mudar
    const safety = setInterval(() => finish(), 10000);
    timers.current.push(ramp, safety);
  }

  function finish() {
    clear();
    setWidth(100);
    const t = setInterval(() => {
      setVisible(false);
      setWidth(0);
      clear();
    }, 250);
    timers.current.push(t);
  }

  // Completa quando a rota muda.
  useEffect(() => {
    if (visible) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 9999,
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.2s ease',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${width}%`,
          background: 'hsl(var(--accent))',
          boxShadow: '0 0 8px hsl(var(--accent))',
          transition: 'width 0.2s ease-out',
        }}
      />
    </div>
  );
}
