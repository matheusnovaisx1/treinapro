'use client';

import { useEffect } from 'react';
import { fireConfetti } from '@/lib/confetti';

// Dispara o confete uma única vez por conquista (identificada por `id`),
// lembrando via localStorage para não repetir a cada visita.
export function CelebrateOnce({ id }: { id: string }) {
  useEffect(() => {
    try {
      const key = `tp_celebrated_${id}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, '1');
        // pequeno atraso para a tela pintar antes da animação
        setTimeout(fireConfetti, 300);
      }
    } catch {
      /* localStorage indisponível: ignora */
    }
  }, [id]);
  return null;
}
