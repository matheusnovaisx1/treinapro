'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, initials } from '@/lib/utils';
import { medal, type LeaderboardRow } from '@/lib/challenges';

// Ranking do desafio. Busca via RPC (challenge_leaderboard) e destaca o aluno
// informado em highlightStudentId (para o próprio aluno se ver na lista).
export function Leaderboard({
  challengeId,
  highlightStudentId,
}: {
  challengeId: string;
  highlightStudentId?: string;
}) {
  const supabase = createClient();
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .rpc('challenge_leaderboard', { p_challenge_id: challengeId })
      .then(({ data }) => {
        if (!cancelled) setRows((data as LeaderboardRow[]) ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [challengeId, supabase]);

  if (rows === null) {
    return <p className="py-6 text-center text-sm text-muted-foreground">Carregando ranking…</p>;
  }
  if (!rows.length) {
    return <p className="py-6 text-center text-sm text-muted-foreground">Nenhum participante ainda.</p>;
  }

  return (
    <ol className="space-y-1.5">
      {rows.map((r) => {
        const isMe = r.student_id === highlightStudentId;
        const m = medal(r.place);
        return (
          <li
            key={r.student_id}
            className={cn(
              'flex items-center gap-3 rounded-lg border px-3 py-2',
              isMe ? 'border-accent bg-accent/5' : 'border-border'
            )}
          >
            <div className="flex w-7 shrink-0 items-center justify-center text-sm font-bold">
              {m ?? <span className="text-muted-foreground">{r.place}º</span>}
            </div>
            <Avatar className="h-8 w-8">
              <AvatarImage src={r.avatar_url ?? undefined} />
              <AvatarFallback className="text-xs">{initials(r.full_name)}</AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1 truncate text-sm font-medium">
              {r.full_name ?? 'Aluno'}
              {isMe && <span className="ml-1 text-xs text-accent">(você)</span>}
            </span>
            <span className="shrink-0 text-sm font-semibold">
              {r.score} <span className="font-normal text-muted-foreground">treino{r.score === 1 ? '' : 's'}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
