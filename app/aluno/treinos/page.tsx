import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { PseHistoryChart } from '@/components/aluno/pse-history-chart';
import { LoadProgressChart } from '@/components/load-progress-chart';
import { EmptyState } from '@/components/ui/empty-state';
import { DumbbellMascot } from '@/components/ui/mascot';

export default async function TreinosHistoricoPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: student } = await supabase.from('students').select('id').eq('profile_id', user!.id).single();

  const [{ data: logs }, { data: workouts }] = student
    ? await Promise.all([
        supabase.from('workout_logs').select('*').eq('student_id', student.id).order('completed_at', { ascending: false }),
        supabase.from('workouts').select('days').eq('student_id', student.id),
      ])
    : [{ data: [] as any[] }, { data: [] as any[] }];

  const chartData = (logs ?? [])
    .slice(0, 15)
    .reverse()
    .map((l) => ({ date: formatDate(l.completed_at), pse: l.pse ?? 0 }));

  // Nomes de exercício (dos treinos do aluno) para o gráfico de carga.
  const exerciseNameById = new Map<string, string>();
  for (const w of workouts ?? []) {
    for (const d of (w.days as any[]) ?? []) {
      for (const e of (d.exercises as any[]) ?? []) {
        if (e.exercise_id && e.name) exerciseNameById.set(e.exercise_id, e.name);
      }
    }
  }

  // Recordes pessoais: maior peso já registrado por exercício.
  const bestByExercise = new Map<string, number>();
  for (const log of logs ?? []) {
    const loads = (log.loads as Record<string, { weight?: string }>) ?? {};
    for (const [exId, v] of Object.entries(loads)) {
      const wt = parseFloat(String(v?.weight ?? '').replace(',', '.'));
      if (!isNaN(wt) && wt > 0) bestByExercise.set(exId, Math.max(bestByExercise.get(exId) ?? 0, wt));
    }
  }
  const records = Array.from(bestByExercise.entries())
    .map(([exId, weight]) => ({ name: exerciseNameById.get(exId) ?? 'Exercício', weight }))
    .sort((a, b) => b.weight - a.weight);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Meu histórico</h1>
        <p className="text-sm text-muted-foreground">Seus treinos concluídos e evolução do esforço percebido.</p>
      </div>

      {records.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">🏆 Meus recordes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
              {records.map((r) => (
                <li key={r.name} className="flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-2 text-sm">
                  <span className="truncate">{r.name}</span>
                  <span className="shrink-0 font-bold text-accent">{r.weight}kg</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <LoadProgressChart logs={(logs as any) ?? []} exerciseNameById={exerciseNameById} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evolução do PSE</CardTitle>
        </CardHeader>
        <CardContent>
          <PseHistoryChart data={chartData} />
        </CardContent>
      </Card>

      <div className="space-y-3">
        {!logs?.length && (
          <EmptyState
            illustration={<DumbbellMascot />}
            title="Bora começar!"
            description="Você ainda não concluiu nenhum treino. Seu primeiro registro aparece aqui."
          />
        )}
        {logs?.map((log) => (
          <Card key={log.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">{formatDate(log.completed_at)}</p>
                {log.comment && <p className="text-xs text-muted-foreground">"{log.comment}"</p>}
              </div>
              <Badge variant={log.pse >= 8 ? 'destructive' : log.pse >= 5 ? 'accent' : 'success'}>PSE {log.pse}/10</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
