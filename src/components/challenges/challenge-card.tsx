import { Trophy, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaderboard } from '@/components/challenges/leaderboard';
import { challengeStatus, daysLeft, STATUS_LABEL } from '@/lib/challenges';
import { formatDate } from '@/lib/utils';

export type ChallengeCardData = {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
};

export function ChallengeCard({
  challenge,
  highlightStudentId,
}: {
  challenge: ChallengeCardData;
  highlightStudentId?: string;
}) {
  const status = challengeStatus(challenge.start_date, challenge.end_date);
  const left = daysLeft(challenge.end_date);

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/15 text-gold">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold leading-tight">{challenge.name}</h3>
              {challenge.description && (
                <p className="text-xs text-muted-foreground">{challenge.description}</p>
              )}
            </div>
          </div>
          <Badge variant={status === 'active' ? 'success' : status === 'scheduled' ? 'secondary' : 'default'}>
            {STATUS_LABEL[status]}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(challenge.start_date)} – {formatDate(challenge.end_date)}
          </span>
          {status === 'active' && left !== null && (
            <span className="font-medium text-accent">
              {left === 0 ? 'Último dia!' : `Faltam ${left} dia${left === 1 ? '' : 's'}`}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Leaderboard challengeId={challenge.id} highlightStudentId={highlightStudentId} />
      </CardContent>
    </Card>
  );
}
