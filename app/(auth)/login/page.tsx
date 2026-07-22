'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Dumbbell, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword(values);

      if (error) {
        const isUnconfirmed = error.message.toLowerCase().includes('confirm');
        toast.error('Não foi possível entrar', {
          description: isUnconfirmed
            ? 'Confirme seu e-mail pelo link que enviamos antes de entrar.'
            : error.message,
        });
        return;
      }

      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError) {
        toast.error('Erro ao carregar seu perfil', { description: profileError.message });
        return;
      }

      if (!profile) {
        // Conta confirmada por e-mail depois do cadastro: o perfil ainda não
        // havia sido criado (só é possível criar com uma sessão ativa). Criamos
        // agora, usando os metadados salvos no momento do signUp.
        const meta = data.user.user_metadata as { full_name?: string; role?: 'personal' | 'aluno' };
        const { data: created, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            role: meta.role ?? 'personal',
            full_name: meta.full_name ?? null,
            email: data.user.email!,
            plan: 'free',
          })
          .select('role')
          .single();

        if (createError) {
          toast.error('Não foi possível preparar sua conta', { description: createError.message });
          return;
        }
        profile = created;
      }

      const redirectTo = searchParams.get('redirectTo');
      const destination = redirectTo ?? (profile?.role === 'personal' ? '/personal/dashboard' : '/aluno/dashboard');
      router.push(destination);
      router.refresh();
    } catch (err) {
      toast.error('Algo deu errado ao entrar', { description: err instanceof Error ? err.message : 'Tente novamente.' });
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Dumbbell className="h-5 w-5" />
          </div>
          <CardTitle className="mt-2">Entrar</CardTitle>
          <CardDescription>Acesse sua conta de personal ou aluno</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="voce@exemplo.com" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" variant="accent" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Entrar
            </Button>
          </form>

          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> ou <div className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" onClick={signInWithGoogle}>
            Continuar com Google
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Ainda não é personal?{' '}
            <Link href="/cadastro" className="font-medium text-primary hover:underline">
              Criar conta grátis
            </Link>
          </p>
          <p className="mt-1 text-center text-xs text-muted-foreground">
            Alunos são cadastrados por convite do seu personal trainer.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
