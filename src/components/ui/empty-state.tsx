import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

// Estado vazio amigável (cozy): emoji grande, título e um texto acolhedor.
export function EmptyState({
  emoji,
  title,
  description,
  children,
}: {
  emoji: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-3xl">{emoji}</div>
        <div className="space-y-1">
          <p className="font-semibold">{title}</p>
          {description && <p className="mx-auto max-w-xs text-sm text-muted-foreground">{description}</p>}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
