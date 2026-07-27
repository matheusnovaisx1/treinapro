'use client';

import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

// Liga/desliga os sons do app (ex.: chime ao concluir treino). Padrão: ligado.
export function SoundToggle({ className, compact = false }: { className?: string; compact?: boolean }) {
  const [on, setOn] = useState(true);

  useEffect(() => {
    try {
      setOn(localStorage.getItem('tp_sound') !== 'off');
    } catch {
      /* ignora */
    }
  }, []);

  function toggle() {
    const next = !on;
    setOn(next);
    try {
      localStorage.setItem('tp_sound', next ? 'on' : 'off');
    } catch {
      /* ignora */
    }
  }

  const label = on ? 'Desativar sons' : 'Ativar sons';
  const Icon = on ? Volume2 : VolumeX;

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
      aria-label={label}
      className={
        className ??
        'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white'
      }
    >
      <Icon className="h-4 w-4" />
      {on ? 'Sons ativados' : 'Sons desativados'}
    </button>
  );
}
