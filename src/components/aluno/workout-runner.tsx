'use client';

import { useState } from 'react';
import { Play, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PseModal } from '@/components/aluno/pse-modal';
import { youtubeThumbnail } from '@/lib/utils';

type Exercise = {
  exercise_id: string;
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes?: string;
  video_url?: string | null;
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

  return (
    <div className="space-y-4">
      <div>
        <Badge variant="accent">{dayKey}</Badge>
        <h1 className="mt-2 font-display text-2xl font-bold">{dayLabel}</h1>
      </div>

      <div className="space-y-3">
        {exercises.map((ex, i) => {
          const thumb = youtubeThumbnail(ex.video_url);
          return (
            <Card key={i}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                  {thumb ? (
                    <img src={thumb} alt={ex.name} className="h-full w-full object-cover" />
                  ) : (
                    <Play className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{ex.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {ex.sets}x{ex.reps} · pausa {ex.rest_seconds}s
                  </p>
                  {ex.notes && <p className="text-xs text-muted-foreground">{ex.notes}</p>}
                </div>
                {ex.video_url && (
                  <a href={ex.video_url} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="ghost">
                      <Play className="h-4 w-4" />
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button size="lg" variant="accent" className="w-full" onClick={() => setPseOpen(true)}>
        <CheckCircle2 className="h-5 w-5" /> Concluir treino
      </Button>

      <PseModal open={pseOpen} onOpenChange={setPseOpen} workoutId={workoutId} studentId={studentId} dayKey={dayKey} />
    </div>
  );
}
