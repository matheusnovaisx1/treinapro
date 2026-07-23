'use client';

import Image from 'next/image';
import { Play, Trash2, Plus, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, youtubeThumbnail } from '@/lib/utils';

export type ExerciseRow = {
  id: string;
  name: string;
  category: string | null;
  muscle_group: string | null;
  equipment: string | null;
  video_url: string | null;
  is_public: boolean;
  created_by: string | null;
};

export function ExerciseGrid({
  exercises,
  mode = 'manage',
  currentUserId,
  onSelect,
  onDelete,
  selectedIds,
  onToggle,
}: {
  exercises: ExerciseRow[];
  mode?: 'manage' | 'picker';
  currentUserId?: string;
  onSelect?: (exercise: ExerciseRow) => void;
  onDelete?: (id: string) => void;
  // Modo múltiplo (seleção): quando onToggle é passado, o card vira um toggle.
  selectedIds?: Set<string>;
  onToggle?: (exercise: ExerciseRow) => void;
}) {
  if (!exercises.length) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Nenhum exercício encontrado.</p>;
  }

  const multi = mode === 'picker' && !!onToggle;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {exercises.map((ex) => {
        const thumb = youtubeThumbnail(ex.video_url);
        const isOwner = ex.created_by === currentUserId;
        const selected = selectedIds?.has(ex.id) ?? false;
        return (
          <Card
            key={ex.id}
            onClick={multi ? () => onToggle?.(ex) : undefined}
            className={cn(
              'overflow-hidden',
              multi && 'cursor-pointer transition-colors',
              multi && selected && 'border-accent ring-1 ring-accent'
            )}
          >
            <div className="relative h-32 w-full bg-muted">
              {thumb ? (
                <Image src={thumb} alt={ex.name} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <Play className="h-6 w-6" />
                </div>
              )}
              {!ex.is_public && <Badge className="absolute left-2 top-2">Próprio</Badge>}
            </div>
            <CardContent className="space-y-2 p-4">
              <p className="font-medium leading-tight">{ex.name}</p>
              <div className="flex flex-wrap gap-1">
                {ex.category && <Badge variant="secondary">{ex.category}</Badge>}
                {ex.equipment && <Badge variant="outline">{ex.equipment}</Badge>}
              </div>
              <div className="flex items-center justify-between pt-1">
                {mode === 'picker' ? (
                  multi ? (
                    <div
                      className={cn(
                        'flex w-full items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium',
                        selected ? 'border-accent bg-accent/10 text-accent' : 'border-input text-muted-foreground'
                      )}
                    >
                      {selected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      {selected ? 'Selecionado' : 'Selecionar'}
                    </div>
                  ) : (
                    <Button size="sm" variant="accent" className="w-full" onClick={() => onSelect?.(ex)}>
                      <Plus className="h-4 w-4" /> Adicionar ao treino
                    </Button>
                  )
                ) : (
                  isOwner && (
                    <Button size="sm" variant="ghost" onClick={() => onDelete?.(ex.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" /> Excluir
                    </Button>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
