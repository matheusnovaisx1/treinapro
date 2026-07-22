import Link from 'next/link';
import { Dumbbell, ClipboardList, Camera, ArrowRight, PlayCircle, Trophy } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressRing } from '@/components/aluno/progress-ring';
import { calculateStreak } from '@/lib/utils';
import { computeAchievements, nextAchievement } from '@/lib/achievements';

export default async function AlunoDashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user!.id).single();

  const { data: student } = await supabase.from('students').select('id').eq('profile_id', user!.id).single();

  const { data: workout } = student
    ? await supabase
        .from('workouts')
        .select('*')
        .eq('student_id', student.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };

  let nextDay: any = null;
  if (workout) {
    const days = (workout.days as any[]) ?? [];
    const { data: lastLog } = await supabase
      .from('workout_logs')
      .select('day_key')
      .eq('workout_id', workout.id)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const lastIndex = lastLog ? days.findIndex((d) => d.key === lastLog.day_key) : -1;
    nextDay = days[(lastIndex + 1) % (days.length || 1)] ?? null;
  }

  const { count: pendingAnamnese } = student
    ? await supabase.from('anamneses').select('id', { count: 'exact', head: true }).eq('student_id', student.id).eq('status', 'pending')
    : { count: 0 };

  const { count: pendingAssessments } = student
    ? await supabase
        .from('assessments')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', student.id)
        .eq('requested', true)
    : { count: 0 };

  const { data: recentLogs } = student
    ? await supabase.from('workout_logs').select('completed_at').eq('student_id', student.id).order('completed_at', { ascending: false }).limit(90)
    : { data: [] as any[] };

  const { count: totalWorkouts } = student
    ? await supabase.from('workout_logs').select('id', { count: 'exact', head: true }).eq('student_id', student.id)
    : { count: 0 };

  const streak = calculateStreak((recentLogs ?? []).map((l) => l.completed_at));

  // Meta semanal: quantos dias a rotina ativa tem vs. quantos treinos foram
  // concluídos nos últimos 7 dias.
  const weeklyTarget = ((workout?.days as any[]) ?? []).length;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weeklyCompleted = (recentLogs ?? []).filter((l) => new Date(l.completed_at) >= sevenDaysAgo).length;
  const weeklyPercent = weeklyTarget > 0 ? (weeklyCompleted / weeklyTarget) * 100 : 0;
  const goalMet = weeklyTarget > 0 && weeklyCompleted >= weeklyTarget;

  const achievements = computeAchievements(streak, totalWorkouts ?? 0);
  const upNext = nextAchievement(streak, totalWorkouts ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Olá, {profile?.full_name?.split(' ')[0] ?? 'aluno'} 💪</h1>
          <p className="text-sm text-muted-foreground">Vamos treinar hoje?</p>
        </div>
        {streak > 0 && (
          <Badge variant="fire" className="gap-1 text-sm">
            🔥 {streak} {streak === 1 ? 'dia' : 'dias'} seguidos
          </Badge>
        )}
      </div>

      {goalMet && (
        <Card className="border-none bg-gradient-to-br from-gold to-[hsl(38_96%_46%)] shadow-[0_5px_0_0_hsl(var(--gold-shadow))]">
          <CardContent className="flex items-center gap-3 p-5">
            <Trophy className="h-8 w-8 shrink-0 text-gold-foreground" />
            <div>
              <p className="font-display font-bold text-gold-foreground">Meta da semana batida! 🎉</p>
              <p className="text-sm text-gold-foreground/80">
                {weeklyCompleted} de {weeklyTarget} treinos concluídos. Continue assim!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {workout && nextDay ? (
        <Card className="border-none bg-primary text-primary-foreground">
          <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
            {weeklyTarget > 0 && (
              <ProgressRing
                percent={weeklyPercent}
                label={`${weeklyCompleted}/${weeklyTarget}`}
                color={goalMet ? 'hsl(var(--gold))' : 'hsl(var(--success))'}
              />
            )}
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-white/70">Treino de hoje</span>
                <Badge variant="accent">{nextDay.key}</Badge>
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold">{nextDay.label}</h2>
                <p className="text-sm text-white/70">{(nextDay.exercises ?? []).length} exercício(s) · {workout.name}</p>
              </div>
              <Button size="lg" variant="accent" asChild>
                <Link href={`/aluno/treinos/${workout.id}?day=${nextDay.key}`}>
                  <PlayCircle className="h-5 w-5" /> Iniciar treino
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Seu personal ainda não criou uma rotina de treino ativa.
          </CardContent>
        </Card>
      )}

      {(!!pendingAnamnese || !!pendingAssessments) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {!!pendingAnamnese && (
            <Card>
              <CardContent className="flex items-center justify-between gap-3 p-5">
                <div className="flex items-center gap-3">
                  <ClipboardList className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-medium">Anamnese pendente</p>
                    <p className="text-xs text-muted-foreground">Seu personal está aguardando suas respostas.</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/aluno/anamnese">
                    Preencher <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
          {!!pendingAssessments && (
            <Card>
              <CardContent className="flex items-center justify-between gap-3 p-5">
                <div className="flex items-center gap-3">
                  <Camera className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-medium">Avaliação solicitada</p>
                    <p className="text-xs text-muted-foreground">Envie suas fotos ou medidas.</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/aluno/avaliacoes">
                    Enviar <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4 text-gold" /> Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {achievements.length ? (
            <div className="flex flex-wrap gap-2">
              {achievements.map((a) => (
                <Badge key={a.id} variant="gold">
                  {a.emoji} {a.label}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Complete treinos para desbloquear suas primeiras conquistas.</p>
          )}
          {upNext && (
            <p className="text-xs text-muted-foreground">
              Próxima: {upNext.emoji} {upNext.label} — faltam {upNext.remaining}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Dumbbell className="h-4 w-4" /> Seu histórico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="ghost" asChild>
            <Link href="/aluno/treinos">
              Ver treinos concluídos e evolução <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
