'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Repeat, Link2, Link2Off, Timer } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type DayExercise = {
  uid: string;
  exercise_id: string;
  name: string;
  category?: string | null;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes: string;
  unit?: 'reps' | 'seg' | null; // 'seg' = isometria (reps são segundos)
  group?: string | null; // id do super-set (bi/tri-set) com exercícios vizinhos
};

export function SortableExerciseItem({
  item,
  onChange,
  onRemove,
  onSubstitute,
  onToggleGroup,
  canGroup = false,
  grouped = false,
}: {
  item: DayExercise;
  onChange: (uid: string, patch: Partial<DayExercise>) => void;
  onRemove: (uid: string) => void;
  onSubstitute: (uid: string) => void;
  onToggleGroup?: (uid: string) => void;
  canGroup?: boolean; // existe um exercício anterior para linkar
  grouped?: boolean; // já está agrupado com o anterior
}) {
  const isIso = item.unit === 'seg';
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.uid });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex flex-col gap-3 rounded-md border bg-background p-3 sm:flex-row sm:items-center">
      <button type="button" className="cursor-grab text-muted-foreground touch-none" {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex-1 min-w-[140px] font-medium">{item.name}</div>

      <div className="grid grid-cols-4 gap-2 sm:w-auto sm:flex sm:items-center">
        <Input
          type="number"
          min={1}
          className="w-16"
          value={item.sets}
          onChange={(e) => onChange(item.uid, { sets: Number(e.target.value) })}
          aria-label="Séries"
        />
        <Input
          className="w-20"
          placeholder={isIso ? 'seg' : 'reps'}
          value={item.reps}
          onChange={(e) => onChange(item.uid, { reps: e.target.value })}
          aria-label={isIso ? 'Segundos de isometria' : 'Repetições'}
        />
        {/* Alterna repetições ↔ isometria (segundos) */}
        <Button
          size="sm"
          variant={isIso ? 'accent' : 'outline'}
          className="w-14 px-0"
          onClick={() => onChange(item.uid, { unit: isIso ? 'reps' : 'seg' })}
          title={isIso ? 'Isometria (segundos)' : 'Repetições'}
        >
          {isIso ? <Timer className="h-3.5 w-3.5" /> : null}
          {isIso ? 'seg' : 'reps'}
        </Button>
        <Input
          type="number"
          min={0}
          className="w-20"
          placeholder="pausa (s)"
          value={item.rest_seconds}
          onChange={(e) => onChange(item.uid, { rest_seconds: Number(e.target.value) })}
          aria-label="Pausa em segundos"
        />
      </div>

      <Input
        className="sm:w-48"
        placeholder="Observações"
        value={item.notes}
        onChange={(e) => onChange(item.uid, { notes: e.target.value })}
      />

      {canGroup && onToggleGroup && (
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onToggleGroup(item.uid)}
          title={grouped ? 'Desagrupar do exercício anterior' : 'Agrupar com o anterior (bi/tri-set)'}
        >
          {grouped ? (
            <Link2Off className="h-4 w-4 text-accent" />
          ) : (
            <Link2 className={cn('h-4 w-4 text-muted-foreground')} />
          )}
        </Button>
      )}

      <Button size="icon" variant="ghost" onClick={() => onSubstitute(item.uid)} title="Substituir por outro exercício">
        <Repeat className="h-4 w-4 text-muted-foreground" />
      </Button>

      <Button size="icon" variant="ghost" onClick={() => onRemove(item.uid)}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
