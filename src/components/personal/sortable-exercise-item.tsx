'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Repeat } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export type DayExercise = {
  uid: string;
  exercise_id: string;
  name: string;
  category?: string | null;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes: string;
};

export function SortableExerciseItem({
  item,
  onChange,
  onRemove,
  onSubstitute,
}: {
  item: DayExercise;
  onChange: (uid: string, patch: Partial<DayExercise>) => void;
  onRemove: (uid: string) => void;
  onSubstitute: (uid: string) => void;
}) {
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

      <div className="grid grid-cols-3 gap-2 sm:w-auto sm:flex">
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
          placeholder="reps"
          value={item.reps}
          onChange={(e) => onChange(item.uid, { reps: e.target.value })}
          aria-label="Repetições"
        />
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

      <Button size="icon" variant="ghost" onClick={() => onSubstitute(item.uid)} title="Substituir por outro exercício">
        <Repeat className="h-4 w-4 text-muted-foreground" />
      </Button>

      <Button size="icon" variant="ghost" onClick={() => onRemove(item.uid)}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
