import { Trophy } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { CreateChallengeDialog } from '@/components/personal/create-challenge-dialog';
import { ChallengeCard } from '@/components/challenges/challenge-card';
import { challengeStatus } from '@/lib/challenges';

export default async function DesafiosPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: challenges } = await supabase
    .from('challenges')
    .select('id, name, description, start_date, end_date')
    .eq('personal_id', user!.id)
    .order('start_date', { ascending: false });

  const list = challenges ?? [];
  // Ativos e agendados primeiro; encerrados por último.
  const rank = { active: 0, scheduled: 1, ended: 2 } as const;
  list.sort(
    (a, b) => rank[challengeStatus(a.start_date, a.end_date)] - rank[challengeStatus(b.start_date, b.end_date)]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Desafios</h1>
          <p className="text-sm text-muted-foreground">
            Crie competições entre seus alunos e acompanhe o ranking de treinos.
          </p>
        </div>
        <CreateChallengeDialog />
      </div>

      {list.length ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {list.map((c) => (
            <ChallengeCard key={c.id} challenge={c} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium">Nenhum desafio ainda</p>
              <p className="text-sm text-muted-foreground">
                Crie um desafio para engajar seus alunos com um ranking de treinos.
              </p>
            </div>
            <CreateChallengeDialog />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
