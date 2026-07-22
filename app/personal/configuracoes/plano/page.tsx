import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { PlanManager } from '@/components/personal/plan-manager';

export default async function PlanoPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user!.id).single();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Plano e cobrança</h1>
        <p className="text-sm text-muted-foreground">Gerencie sua assinatura do TreinaPro.</p>
      </div>
      <Suspense fallback={null}>
        <PlanManager plan={profile?.plan ?? 'free'} />
      </Suspense>
    </div>
  );
}
