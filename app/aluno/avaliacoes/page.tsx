import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { AssessmentUploadCard } from '@/components/aluno/assessment-upload-card';
import { AssessmentComparisonCard } from '@/components/personal/assessment-comparison-card';

export default async function AlunoAvaliacoesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: student } = await supabase.from('students').select('id').eq('profile_id', user!.id).single();

  const { data: assessments } = student
    ? await supabase.from('assessments').select('*').eq('student_id', student.id).order('created_at', { ascending: false })
    : { data: [] as any[] };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Minhas avaliações</h1>
        <p className="text-sm text-muted-foreground">Envie fotos e medidas quando seu personal solicitar.</p>
      </div>

      {!assessments?.length && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">Nenhuma avaliação registrada ainda.</CardContent>
        </Card>
      )}

      <AssessmentComparisonCard assessments={(assessments as any) ?? []} />

      <div className="space-y-4">
        {assessments?.map((a) => (
          <AssessmentUploadCard key={a.id} assessment={a as any} userId={user!.id} />
        ))}
      </div>
    </div>
  );
}
