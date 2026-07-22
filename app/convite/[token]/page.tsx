'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Dumbbell, Loader2, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { acceptInviteSchema, type AcceptInviteInput } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type InviteState = 'loading' | 'valid' | 'invalid';

export default function ConviteTokenPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [state, setState] = useState<InviteState>('loading');
  const [personalName, setPersonalName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AcceptInviteInput>({ resolver: zodResolver(acceptInviteSchema) });

  useEffect(() => {
    async function loadInvite() {
      const res = await fetch(`/api/invites/${params.token}`);
      const body = await res.json();

      if (!body.valid) {
        setState('invalid');
        return;
      }

      setPersonalName(body.personalName ?? null);
      if (body.email) setValue('email', body.email);
      setState('valid');
    }
    loadInvite();
  }, [params.token, setValue]);

  async function onSubmit(values: AcceptInviteInput) {
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { full_name: values.fullName, role: 'aluno' } },
    });

    if (error || !data.user) {
      toast.error('Não foi possível criar a conta', { description: error?.message });
      setLoading(false);
      return;
    }

    const res = await fetch('/api/invites/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: params.token, userId: data.user.id, fullName: values.fullName, email: values.email, phone: values.phone }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error('Não foi possível vincular sua conta', {
        description: body.error === 'PLAN_LIMIT_REACHED' ? 'Este personal atingiu o limite do plano gratuito.' : body.error,
      });
      setLoading(false);
      return;
    }

    if (!data.session) {
      toast.success('Quase lá! Confirme seu e-mail para acessar sua conta.', {
        description: 'Enviamos um link de confirmação para ' + values.email,
      });
      setLoading(false);
      router.push('/login');
      return;
    }

    toast.success('Conta criada! Bem-vindo(a).');
    router.push('/aluno/dashboard');
    router.refresh();
  }

  if (state === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (state === 'invalid') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-secondary p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <CardTitle>Convite inválido ou expirado</CardTitle>
            <CardDescription>Peça ao seu personal trainer para gerar um novo link de convite.</CardDescription>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Dumbbell className="h-5 w-5" />
          </div>
          <CardTitle className="mt-2">Você foi convidado{personalName ? ` por ${personalName}` : ''}</CardTitle>
          <CardDescription>Crie sua conta de aluno para começar a treinar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Nome completo</Label>
              <Input id="fullName" placeholder="Seu nome" {...register('fullName')} />
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="voce@exemplo.com" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">WhatsApp (opcional)</Label>
              <Input id="phone" type="tel" placeholder="(11) 98888-7777" {...register('phone')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input id="confirmPassword" type="password" placeholder="••••••••" {...register('confirmPassword')} />
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" variant="accent" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Criar minha conta
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
