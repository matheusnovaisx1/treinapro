import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlanBuilder } from '@/components/personal/plan-builder';
import { PlanTimeline } from '@/components/periodization/plan-timeline';
import { PhaseProgress } from '@/components/periodization/phase-progress';
import { computeProgress, GOAL_LABELS, type MesocycleRow } from '@/lib/periodization';

export default async function StudentPlanPage({
  params,
  searchParams,
}: {
  params: { studentId: string };
  searchParams: { novo?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: student } = await supabase
    .from('students')
    .select('id, profile:profiles!students_profile_id_fkey(full_name)')
    .eq('id', params.studentId)
    .eq('personal_id', user!.id)
    .single();

  if (!student) notFound();
  const studentName = (student.profile as any)?.full_name ?? 'Aluno';

  const { data: activePlan } = await supabase
    .from('training_plans')
    .select('id, name, goal, start_date, end_date, mesocycles(ord, focus, planned_weeks, start_date, end_date)')
    .eq('student_id', student.id)
    .eq('status', 'active')
    .maybeSingle();

  const wantsNew = searchParams.novo === '1';
  const showBuilder = !activePlan || wantsNew;

  const mesos: MesocycleRow[] = ((activePlan?.mesocycles as any[]) ?? []).sort((a, b) => a.ord - b.ord);
  const progress = mesos.length ? computeProgress(mesos) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/personal/alunos/${student.id}`} aria-label="Voltar">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold">Periodização</h1>
          <p className="text-sm text-muted-foreground">{studentName}</p>
        </div>
      </div>

      {showBuilder ? (
        <>
          {activePlan && (
            <div className="rounded-md border border-accent/40 bg-accent/5 px-4 py-3 text-sm">
              Criar um novo plano vai <strong>concluir</strong> o plano ativo atual. As fichas de treino já
              montadas não são apagadas.
            </div>
          )}
          <PlanBuilder studentId={student.id} studentName={studentName} />
        </>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            {progress && <PhaseProgress progress={progress} />}
            <Card>
              <CardContent className="space-y-1 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Objetivo</span>
                  <span className="font-medium">{GOAL_LABELS[activePlan!.goal as keyof typeof GOAL_LABELS]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total de fases</span>
                  <span className="font-medium">{mesos.length}</span>
                </div>
              </CardContent>
            </Card>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/personal/alunos/${student.id}/plano?novo=1`}>
                <RefreshCw className="h-4 w-4" /> Refazer plano
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Linha do tempo das fases</CardTitle>
            </CardHeader>
            <CardContent>
              <PlanTimeline
                phases={mesos.map((m) => ({
                  ord: m.ord,
                  focus: m.focus,
                  plannedWeeks: m.planned_weeks,
                  startDate: m.start_date,
                  endDate: m.end_date,
                }))}
                currentOrd={progress?.currentOrd}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
