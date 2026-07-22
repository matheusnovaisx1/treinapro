'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-secondary p-4 text-center">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <h1 className="font-display text-2xl font-bold">Algo deu errado</h1>
          <p className="max-w-sm text-muted-foreground">
            Ocorreu um erro inesperado. Você pode tentar novamente ou voltar mais tarde.
          </p>
          <Button variant="accent" onClick={() => reset()}>
            Tentar novamente
          </Button>
        </main>
      </body>
    </html>
  );
}
