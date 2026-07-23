import { Trophy } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { ChallengeCard } from '@/components/challenges/challenge-card';
import { challengeStatus } from '@/lib/challenges';

export default async function AlunoDesafiosPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: student } = await supabase.from('students').select('id').eq('profile_id', user!.id).single();

  // Desafios em que o aluno participa (RLS já restringe aos dele).
  const { data: participations } = student
    ? await supabase
        .from('challenge_participants')
        .select('challenge:challenges(id, name, description, start_date, end_date)')
        .eq('student_id', student.id)
    : { data: [] as any[] };

  const challenges = (participations ?? [])
    .map((p: any) => p.challenge)
    .filter(Boolean) as {
    id: string;
    name: string;
    description: string | null;
    start_date: string;
    end_date: string;
  }[];

  const rank = { active: 0, scheduled: 1, ended: 2 } as const;
  challenges.sort(
    (a, b) => rank[challengeStatus(a.start_date, a.end_date)] - rank[challengeStatus(b.start_date, b.end_date)]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Desafios 🏆</h1>
        <p className="text-sm text-muted-foreground">Treine mais e suba no ranking do seu grupo.</p>
      </div>

      {challenges.length ? (
        <div className="space-y-6">
          {challenges.map((c) => (
            <ChallengeCard key={c.id} challenge={c} highlightStudentId={student!.id} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold">
              <Trophy className="h-6 w-6" />
            </div>
            <p className="text-sm text-muted-foreground">
              Você ainda não está em nenhum desafio. Quando seu personal criar um, ele aparece aqui.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
