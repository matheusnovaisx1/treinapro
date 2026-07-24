'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

// Alterna entre tema claro e escuro (padrão: escuro). Persiste em localStorage
// e aplica a classe 'light' no <html>. O script no layout evita flash no load.
export function ThemeToggle({ className, compact = false }: { className?: string; compact?: boolean }) {
  const [light, setLight] = useState(false);

  useEffect(() => {
    setLight(document.documentElement.classList.contains('light'));
  }, []);

  function toggle() {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle('light', next);
    try {
      localStorage.setItem('tp_theme', next ? 'light' : 'dark');
    } catch {
      /* ignora storage indisponível */
    }
  }

  const label = light ? 'Mudar para tema escuro' : 'Mudar para tema claro';
  const Icon = light ? Moon : Sun;

  if (compact) {
    return (
      <button
        onClick={toggle}
        aria-label={label}
        title={label}
        className={
          className ??
          'inline-flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted hover:text-foreground'
        }
      >
        <Icon className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className={
        className ??
        'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white'
      }
      aria-label={label}
    >
      <Icon className="h-4 w-4" />
      {light ? 'Tema escuro' : 'Tema claro'}
    </button>
  );
}
