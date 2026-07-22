import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnamneseForm } from '@/components/aluno/anamnese-form';
import { formatDate } from '@/lib/utils';

export default async function AlunoAnamnesePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: student } = await supabase.from('students').select('id').eq('profile_id', user!.id).single();

  const { data: anamneses } = student
    ? await supabase.from('anamneses').select('*').eq('student_id', student.id).order('sent_at', { ascending: false })
    : { data: [] as any[] };

  const pending = anamneses?.find((a) => a.status === 'pending');
  const completed = anamneses?.filter((a) => a.status === 'completed') ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Anamnese</h1>
        <p className="text-sm text-muted-foreground">Suas informações de saúde ajudam seu personal a montar treinos seguros.</p>
      </div>

      {pending ? (
        <AnamneseForm anamneseId={pending.id} questions={pending.questions ?? []} />
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Nenhuma anamnese pendente no momento.
          </CardContent>
        </Card>
      )}

      {!!completed.length && (
        <div className="space-y-3">
          <h2 className="font-medium text-sm text-muted-foreground">Respondidas anteriormente</h2>
          {completed.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex items-center justify-between p-4">
                <span className="text-sm">Respondida em {formatDate(a.completed_at)}</span>
                <Badge variant="success">Concluída</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
