import Link from 'next/link';
import { Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-secondary p-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Dumbbell className="h-6 w-6" />
      </div>
      <h1 className="font-display text-3xl font-bold">Página não encontrada</h1>
      <p className="max-w-sm text-muted-foreground">
        O link que você acessou não existe ou foi movido. Volte para o início e tente novamente.
      </p>
      <Button variant="accent" asChild>
        <Link href="/">Voltar ao início</Link>
      </Button>
    </main>
  );
}
