import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { PseHistoryChart } from '@/components/aluno/pse-history-chart';

export default async function TreinosHistoricoPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: student } = await supabase.from('students').select('id').eq('profile_id', user!.id).single();

  const { data: logs } = student
    ? await supabase.from('workout_logs').select('*').eq('student_id', student.id).order('completed_at', { ascending: false })
    : { data: [] as any[] };

  const chartData = (logs ?? [])
    .slice(0, 15)
    .reverse()
    .map((l) => ({ date: formatDate(l.completed_at), pse: l.pse ?? 0 }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Meu histórico</h1>
        <p className="text-sm text-muted-foreground">Seus treinos concluídos e evolução do esforço percebido.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evolução do PSE</CardTitle>
        </CardHeader>
        <CardContent>
          <PseHistoryChart data={chartData} />
        </CardContent>
      </Card>

      <div className="space-y-3">
        {!logs?.length && <p className="py-6 text-center text-sm text-muted-foreground">Você ainda não concluiu nenhum treino.</p>}
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
