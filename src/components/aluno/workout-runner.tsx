'use client';

import { useEffect, useMemo, useState } from 'react';
import { Play, CheckCircle2, Circle, Timer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PseModal } from '@/components/aluno/pse-modal';
import { cn, youtubeThumbnail } from '@/lib/utils';
import { formatScheme, groupConsecutive, supersetLabel, formatClock } from '@/lib/workout-format';

export type LoadEntry = { weight?: string; reps?: string };

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
  lastLoads = {},
  bestLoads = {},
}: {
  workoutId: string;
  studentId: string;
  dayKey: string;
  dayLabel: string;
  exercises: Exercise[];
  lastLoads?: Record<string, LoadEntry>;
  bestLoads?: Record<string, number>;
}) {
  const [pseOpen, setPseOpen] = useState(false);
  const [startAt, setStartAt] = useState<number | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [done, setDone] = useState<Set<string>>(new Set());
  const [finalDuration, setFinalDuration] = useState<number>(0);
  const [loads, setLoads] = useState<Record<string, LoadEntry>>({});
  const [records, setRecords] = useState<{ name: string; weight: number }[]>([]);
  const [restEndsAt, setRestEndsAt] = useState<number | null>(null);

  function setLoad(exerciseId: string, patch: LoadEntry) {
    setLoads((prev) => ({ ...prev, [exerciseId]: { ...prev[exerciseId], ...patch } }));
  }

  function startRest(seconds: number) {
    if (seconds > 0) {
      setRestEndsAt(Date.now() + seconds * 1000);
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
    }
  }

  const started = startAt !== null;

  // Cronômetro: atualiza a cada segundo enquanto o treino está em andamento.
  useEffect(() => {
    if (!started || pseOpen) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [started, pseOpen]);

  const elapsed = started ? Math.floor((now - startAt!) / 1000) : 0;
  const restRemaining = restEndsAt ? Math.max(0, Math.ceil((restEndsAt - now) / 1000)) : 0;

  // Ao acabar o descanso, avisa (vibra) e some a barra.
  useEffect(() => {
    if (restEndsAt && restRemaining === 0) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(200);
      setRestEndsAt(null);
    }
  }, [restEndsAt, restRemaining]);

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
    setRestEndsAt(null);

    // Detecta recordes pessoais: peso informado maior que o melhor anterior.
    const recs: { name: string; weight: number }[] = [];
    for (const ex of exercises) {
      const w = parseFloat(String(loads[ex.exercise_id]?.weight ?? '').replace(',', '.'));
      const prev = bestLoads[ex.exercise_id];
      if (!isNaN(w) && w > 0 && prev !== undefined && w > prev) recs.push({ name: ex.name, weight: w });
    }
    setRecords(recs);

    setPseOpen(true);
  }

  const total = exercises.length;
  const doneCount = done.size;

  return (
    <div className="space-y-4 pb-4">
      {/* Hero: nome do treino + ação principal (iniciar) ou cronômetro */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <Badge variant="accent">{dayKey}</Badge>
        <h1 className="mt-2 font-display text-2xl font-bold">{dayLabel}</h1>
        {!started ? (
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              {total} exercício{total === 1 ? '' : 's'} · toque em iniciar para começar
            </p>
            <Button size="lg" variant="accent" className="mt-4 w-full" onClick={start}>
              <Play className="h-5 w-5" /> Iniciar treino
            </Button>
          </>
        ) : (
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-2 font-display text-2xl font-bold tabular-nums text-accent">
              <Timer className="h-5 w-5" />
              {formatClock(elapsed)}
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {doneCount}/{total} feitos
            </span>
          </div>
        )}
      </div>

      <p className="px-1 text-sm font-semibold text-muted-foreground">
        {started ? 'Marque cada exercício ao terminar ✓' : 'Exercícios de hoje'}
      </p>

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
                  {!started && (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                      {idx + 1}
                    </span>
                  )}
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
                    {started && (
                      <div className="mt-2 flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Input
                          type="number"
                          inputMode="decimal"
                          className="h-8 w-20"
                          placeholder={lastLoads[ex.exercise_id]?.weight ? `${lastLoads[ex.exercise_id].weight}kg` : 'kg'}
                          value={loads[ex.exercise_id]?.weight ?? ''}
                          onChange={(e) => setLoad(ex.exercise_id, { weight: e.target.value })}
                          aria-label="Peso em kg"
                        />
                        <span className="text-xs text-muted-foreground">×</span>
                        <Input
                          className="h-8 w-16"
                          placeholder={lastLoads[ex.exercise_id]?.reps ?? 'reps'}
                          value={loads[ex.exercise_id]?.reps ?? ''}
                          onChange={(e) => setLoad(ex.exercise_id, { reps: e.target.value })}
                          aria-label="Repetições feitas"
                        />
                        {lastLoads[ex.exercise_id]?.weight && (
                          <span className="text-xs text-muted-foreground">última: {lastLoads[ex.exercise_id].weight}kg</span>
                        )}
                        {ex.rest_seconds > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="ml-auto h-8"
                            onClick={() => startRest(ex.rest_seconds)}
                          >
                            <Timer className="h-3.5 w-3.5" /> Descansar {ex.rest_seconds}s
                          </Button>
                        )}
                      </div>
                    )}
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

      {started && (
        <Button size="lg" variant="success" className="w-full" onClick={finish}>
          <CheckCircle2 className="h-5 w-5" />
          {doneCount < total ? `Concluir treino (${doneCount}/${total})` : 'Concluir treino'}
        </Button>
      )}

      {/* Barra de descanso: fica acima da navegação inferior no mobile. */}
      {restEndsAt && restRemaining > 0 && (
        <div className="fixed inset-x-0 bottom-16 z-40 mx-auto max-w-3xl px-4 sm:bottom-4">
          <div className="flex items-center gap-3 rounded-xl border bg-primary px-4 py-3 text-primary-foreground shadow-lg">
            <Timer className="h-5 w-5 text-accent" />
            <span className="font-display text-2xl font-bold tabular-nums">{formatClock(restRemaining)}</span>
            <span className="text-sm text-white/70">descanso</span>
            <div className="ml-auto flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => setRestEndsAt((v) => (v ? v + 15000 : null))}
              >
                +15s
              </Button>
              <Button size="sm" variant="accent" onClick={() => setRestEndsAt(null)}>
                Pular
              </Button>
            </div>
          </div>
        </div>
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
        loads={Object.fromEntries(
          Object.entries(loads).filter(([, v]) => v && (v.weight || v.reps))
        )}
        records={records}
      />
    </div>
  );
}
