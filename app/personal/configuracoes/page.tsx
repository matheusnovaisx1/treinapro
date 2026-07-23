import Link from 'next/link';
import { Crown, ArrowRight, Palette } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPlanTier } from '@/lib/plans';
import { DeleteAccountCard } from '@/components/personal/delete-account-card';

export default async function ConfiguracoesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from('profiles').select('full_name, email, plan').eq('id', user!.id).single();
  const tier = getPlanTier(profile?.plan ?? 'free');

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Configurações</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Nome: </span>
            {profile?.full_name}
          </p>
          <p>
            <span className="text-muted-foreground">E-mail: </span>
            {profile?.email}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between p-5">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">Marca e página pública</span>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/personal/configuracoes/marca">
              Editar <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between p-5">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">Plano {tier.name}</span>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/personal/configuracoes/plano">
              Gerenciar <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <DeleteAccountCard email={profile?.email ?? ''} />
    </div>
  );
}
