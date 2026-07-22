import Link from 'next/link';
import { Users, Crown, ClipboardList, Dumbbell, MessageSquare, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { InviteStudentDialog } from '@/components/personal/invite-student-dialog';
import { OverviewPerformanceChart, type WeeklyStat } from '@/components/personal/overview-performance-chart';
import { initials } from '@/lib/utils';
import { getPlanTier } from '@/lib/plans';

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // segunda-feira
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function PersonalDashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from('profiles').select('full_name, plan').eq('id', user!.id).single();
  const tier = getPlanTier(profile?.plan ?? 'free');

  const { data: students } = await supabase
    .from('students')
    .select('id, status, created_at, profile:profiles!students_profile_id_fkey(full_name, avatar_url)')
    .eq('personal_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const { count: totalAlunos } = await supabase
    .from('students')
    .select('id', { count: 'exact', head: true })
    .eq('personal_id', user!.id);

  const { count: pendingFeedback } = await supabase
    .from('anamneses')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');

  // Gráfico agregado: treinos concluídos e PSE médio por semana (últimas 8 semanas),
  // somando todos os alunos deste personal.
  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 8 * 7);

  const { data: recentLogs } = await supabase
    .from('workout_logs')
    .select('completed_at, pse, students!inner(personal_id)')
    .eq('students.personal_id', user!.id)
    .gte('completed_at', eightWeeksAgo.toISOString());

  const weeks: WeeklyStat[] = Array.from({ length: 8 }).map((_, i) => {
    const weekStart = startOfWeek(new Date());
    weekStart.setDate(weekStart.getDate() - (7 - i) * 7);
    return { week: weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), trainings: 0, avgPse: null };
  });

  const pseByWeek = new Map<number, number[]>();
  (recentLogs ?? []).forEach((log: any) => {
    const logWeekStart = startOfWeek(new Date(log.completed_at)).getTime();
    const index = weeks.findIndex((w, i) => {
      const ws = startOfWeek(new Date());
      ws.setDate(ws.getDate() - (7 - i) * 7);
      return ws.getTime() === logWeekStart;
    });
    if (index >= 0) {
      weeks[index].trainings += 1;
      if (log.pse != null) {
        const arr = pseByWeek.get(index) ?? [];
        arr.push(log.pse);
        pseByWeek.set(index, arr);
      }
    }
  });
  pseByWeek.forEach((values, index) => {
    weeks[index].avgPse = Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1));
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Olá, {profile?.full_name?.split(' ')[0] ?? 'personal'} 👋</h1>
          <p className="text-sm text-muted-foreground">Aqui está um resumo da sua carteira de alunos.</p>
        </div>
        <InviteStudentDialog currentPlan={profile?.plan} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalAlunos ?? 0}</p>
              <p className="text-xs text-muted-foreground">Alunos ativos</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-accent/10 text-accent">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tier.name}</p>
              <p className="text-xs text-muted-foreground">Plano atual</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingFeedback ?? 0}</p>
              <p className="text-xs text-muted-foreground">Anamneses pendentes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {profile?.plan !== 'premium' && (
        <Card className="border-accent/40 bg-accent/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-accent" />
              <div>
                <p className="font-medium">
                  Você está no plano {tier.name} ({tier.studentLimit ? `${tier.studentLimit} aluno(s)` : 'ilimitado'})
                </p>
                <p className="text-sm text-muted-foreground">Faça upgrade para liberar mais alunos e recursos avançados.</p>
              </div>
            </div>
            <Button variant="accent" asChild>
              <Link href="/personal/configuracoes/plano">
                Ver planos <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Desempenho da carteira (últimas 8 semanas)</CardTitle>
        </CardHeader>
        <CardContent>
          <OverviewPerformanceChart data={weeks} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Alunos recentes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/personal/alunos">
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {!students?.length && <p className="py-6 text-center text-sm text-muted-foreground">Nenhum aluno cadastrado ainda.</p>}
            {students?.map((s: any) => (
              <Link
                key={s.id}
                href={`/personal/alunos/${s.id}`}
                className="flex items-center justify-between rounded-md px-3 py-3 hover:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={s.profile?.avatar_url ?? undefined} />
                    <AvatarFallback>{initials(s.profile?.full_name)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{s.profile?.full_name ?? 'Aluno'}</span>
                </div>
                <Badge variant={s.status === 'active' ? 'success' : 'secondary'}>
                  {s.status === 'active' ? 'Ativo' : s.status}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/personal/anamneses">
                <ClipboardList className="h-4 w-4" /> Enviar anamnese
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/personal/alunos">
                <Dumbbell className="h-4 w-4" /> Criar treino
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/personal/alunos">
                <MessageSquare className="h-4 w-4" /> Ver feedbacks recentes
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
