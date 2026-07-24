'use client';

import { useEffect, useMemo, useState } from 'react';
import { Play, CheckCircle2, Circle, Timer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PseModal } from '@/components/aluno/pse-modal';
import { cn, youtubeThumbnail } from '@/lib/utils';
import { formatScheme, groupConsecutive, supersetLabel, formatClock } from '@/lib/workout-format';

type Exercise = {
  uid?: string;
  exercise_id: string;
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes?: string;
  video_url?: string | null;
  unit?: 'reps' | 'seg' | null;
  group?: string | null;
};

export function WorkoutRunner({
  workoutId,
  studentId,
  dayKey,
  dayLabel,
  exercises,
}: {
  workoutId: string;
  studentId: string;
  dayKey: string;
  dayLabel: string;
  exercises: Exercise[];
}) {
  const [pseOpen, setPseOpen] = useState(false);
  const [startAt, setStartAt] = useState<number | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [done, setDone] = useState<Set<string>>(new Set());
  const [finalDuration, setFinalDuration] = useState<number>(0);

  const started = startAt !== null;

  // Cronômetro: atualiza a cada segundo enquanto o treino está em andamento.
  useEffect(() => {
    if (!started || pseOpen) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [started, pseOpen]);

  const elapsed = started ? Math.floor((now - startAt!) / 1000) : 0;

  const keyFor = useMemo(() => {
    return (ex: Exercise, index: number) => ex.uid ?? `i-${index}`;
  }, []);

  function start() {
    const t = Date.now();
    setStartAt(t);
    setNow(t);
  }

  function toggleDone(key: string) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function finish() {
    setFinalDuration(elapsed);
    setPseOpen(true);
  }

  const total = exercises.length;
  const doneCount = done.size;

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Badge variant="accent">{dayKey}</Badge>
          <h1 className="mt-2 font-display text-2xl font-bold">{dayLabel}</h1>
        </div>
        {started && (
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-1.5 font-display text-lg font-bold tabular-nums text-accent">
              <Timer className="h-4 w-4" />
              {formatClock(elapsed)}
            </div>
            <span className="mt-1 text-xs text-muted-foreground">
              {doneCount}/{total} exercícios
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {groupConsecutive(exercises).map((block, bi) => {
          const cards = block.map((ex) => {
            const idx = exercises.indexOf(ex);
            const key = keyFor(ex, idx);
            const isDone = done.has(key);
            const thumb = youtubeThumbnail(ex.video_url);
            return (
              <Card
                key={key}
                onClick={started ? () => toggleDone(key) : undefined}
                className={cn(
                  started && 'cursor-pointer transition-colors',
                  isDone && 'border-success/50 bg-success/5'
                )}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  {started && (
                    <button
                      type="button"
                      aria-label={isDone ? 'Desmarcar' : 'Marcar como concluído'}
                      className="shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDone(key);
                      }}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-6 w-6 text-success" />
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground" />
                      )}
                    </button>
                  )}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                    {thumb ? (
                      <img src={thumb} alt={ex.name} className="h-full w-full object-cover" />
                    ) : (
                      <Play className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn('font-medium', isDone && 'text-muted-foreground line-through')}>{ex.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatScheme(ex)} · pausa {ex.rest_seconds}s
                    </p>
                    {ex.notes && <p className="text-xs text-muted-foreground">{ex.notes}</p>}
                  </div>
                  {ex.video_url && (
                    <a href={ex.video_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="ghost">
                        <Play className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                </CardContent>
              </Card>
            );
          });
          return block.length > 1 ? (
            <div key={bi} className="space-y-2 rounded-xl border border-accent/40 bg-accent/5 p-2">
              <span className="ml-1 text-xs font-semibold text-accent">
                {supersetLabel(block.length)} · faça em sequência, sem descanso entre eles
              </span>
              {cards}
            </div>
          ) : (
            <div key={bi} className="space-y-3">
              {cards}
            </div>
          );
        })}
      </div>

      {!started ? (
        <Button size="lg" variant="accent" className="w-full" onClick={start}>
          <Play className="h-5 w-5" /> Iniciar treino
        </Button>
      ) : (
        <Button size="lg" variant="success" className="w-full" onClick={finish}>
          <CheckCircle2 className="h-5 w-5" />
          {doneCount < total ? `Concluir treino (${doneCount}/${total})` : 'Concluir treino'}
        </Button>
      )}

      <PseModal
        open={pseOpen}
        onOpenChange={setPseOpen}
        workoutId={workoutId}
        studentId={studentId}
        dayKey={dayKey}
        dayLabel={dayLabel}
        exerciseCount={exercises.length}
        durationSeconds={finalDuration}
      />
    </div>
  );
}
