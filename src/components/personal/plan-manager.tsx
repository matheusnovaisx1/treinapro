'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrencyBRL, cn } from '@/lib/utils';
import { PLAN_TIERS, type PlanId } from '@/lib/plans';

export function PlanManager({ plan }: { plan: PlanId }) {
  const searchParams = useSearchParams();
  const [loadingTier, setLoadingTier] = useState<PlanId | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

  useEffect(() => {
    if (searchParams.get('success')) toast.success('Assinatura ativada! 🎉');
    if (searchParams.get('canceled')) toast.info('Assinatura não concluída.');
  }, [searchParams]);

  async function handleUpgrade(tier: PlanId) {
    setLoadingTier(tier);
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier }),
    });
    const body = await res.json();
    setLoadingTier(null);
    if (body.url) window.location.href = body.url;
  }

  async function handleManage() {
    setLoadingPortal(true);
    const res = await fetch('/api/stripe/portal', { method: 'POST' });
    const body = await res.json();
    setLoadingPortal(false);
    if (body.url) window.location.href = body.url;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {PLAN_TIERS.map((tier) => {
          const isCurrent = tier.id === plan;
          return (
            <Card key={tier.id} className={cn(isCurrent && 'border-accent shadow-md')}>
              <CardContent className="flex h-full flex-col p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold">{tier.name}</h3>
                  {isCurrent && <Badge variant="accent">Atual</Badge>}
                </div>
                <p className="mt-3 font-display text-2xl font-bold">
                  {tier.price === 0 ? 'R$ 0' : formatCurrencyBRL(tier.price)}
                  {tier.price > 0 && <span className="text-xs font-normal text-muted-foreground">/mês</span>}
                </p>
                <ul className="mt-3 flex-1 space-y-1.5 text-xs">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 shrink-0 text-success" /> {f}
                    </li>
                  ))}
                </ul>
                {!isCurrent && tier.id !== 'free' && (
                  <Button variant="accent" size="sm" className="mt-4 w-full" onClick={() => handleUpgrade(tier.id)} disabled={loadingTier !== null}>
                    {loadingTier === tier.id && <Loader2 className="h-4 w-4 animate-spin" />}
                    Assinar
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {plan !== 'free' && (
        <Button variant="outline" onClick={handleManage} disabled={loadingPortal}>
          {loadingPortal ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
          Gerenciar assinatura / cancelar
        </Button>
      )}
    </div>
  );
}
