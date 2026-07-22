'use client';

import { useState } from 'react';
import { Crown, Loader2, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrencyBRL } from '@/lib/utils';
import { PLAN_TIERS, type PlanId } from '@/lib/plans';

export function UpgradeModal({
  open,
  onOpenChange,
  currentPlan = 'free',
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentPlan?: PlanId;
}) {
  const [loadingTier, setLoadingTier] = useState<PlanId | null>(null);

  // Mostra apenas os planos pagos acima do plano atual do personal.
  const options = PLAN_TIERS.filter((p) => p.id !== 'free' && p.id !== currentPlan);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
            <Crown className="h-5 w-5" />
          </div>
          <DialogTitle className="text-center">Você atingiu o limite do seu plano</DialogTitle>
          <DialogDescription className="text-center">
            Escolha um plano com mais espaço para continuar cadastrando alunos.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          {options.map((plan) => (
            <Card key={plan.id} className={plan.id === 'pro' ? 'border-accent' : undefined}>
              <CardContent className="flex h-full flex-col p-4">
                <h3 className="font-display font-semibold">{plan.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {plan.studentLimit ? `Até ${plan.studentLimit} alunos` : 'Alunos ilimitados'}
                </p>
                <p className="mt-2 font-display text-2xl font-bold">
                  {formatCurrencyBRL(plan.price)}
                  <span className="text-xs font-normal text-muted-foreground">/mês</span>
                </p>
                <ul className="mt-3 flex-1 space-y-1.5 text-xs">
                  {plan.features.slice(0, 3).map((f) => (
                    <li key={f} className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 shrink-0 text-success" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="accent"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loadingTier !== null}
                >
                  {loadingTier === plan.id && <Loader2 className="h-4 w-4 animate-spin" />}
                  Assinar {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button variant="ghost" onClick={() => onOpenChange(false)}>
          Agora não
        </Button>
      </DialogContent>
    </Dialog>
  );
}
