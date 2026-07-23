'use client';

import { useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Plus, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SortableExerciseItem, type DayExercise } from '@/components/personal/sortable-exercise-item';
import { ExercisePickerDialog } from '@/components/personal/exercise-picker-dialog';
import type { ExerciseRow } from '@/components/personal/exercise-grid';

export type WorkoutDay = {
  key: string;
  label: string;
  exercises: DayExercise[];
};

export function WorkoutDayEditor({
  day,
  exercisesLibrary,
  onChange,
  onRemoveDay,
}: {
  day: WorkoutDay;
  exercisesLibrary: ExerciseRow[];
  onChange: (day: WorkoutDay) => void;
  onRemoveDay: () => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [substitutingUid, setSubstitutingUid] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = day.exercises.findIndex((e) => e.uid === active.id);
    const newIndex = day.exercises.findIndex((e) => e.uid === over.id);
    onChange({ ...day, exercises: arrayMove(day.exercises, oldIndex, newIndex) });
  }

  function addExercises(exs: ExerciseRow[]) {
    const items: DayExercise[] = exs.map((ex) => ({
      uid: nanoid(8),
      exercise_id: ex.id,
      name: ex.name,
      category: ex.category,
      sets: 3,
      reps: '10-12',
      rest_seconds: 60,
      notes: '',
    }));
    onChange({ ...day, exercises: [...day.exercises, ...items] });
  }

  function updateExercise(uid: string, patch: Partial<DayExercise>) {
    onChange({ ...day, exercises: day.exercises.map((e) => (e.uid === uid ? { ...e, ...patch } : e)) });
  }

  function removeExercise(uid: string) {
    onChange({ ...day, exercises: day.exercises.filter((e) => e.uid !== uid) });
  }

  function handleSubstituteSelect(ex: ExerciseRow) {
    if (!substitutingUid) return;
    updateExercise(substitutingUid, { exercise_id: ex.id, name: ex.name, category: ex.category });
    setSubstitutingUid(null);
  }

  const substitutingExercise = day.exercises.find((e) => e.uid === substitutingUid);

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <Input
          className="max-w-xs font-medium"
          value={day.label}
          onChange={(e) => onChange({ ...day, label: e.target.value })}
          placeholder="Ex: Treino A - Peito/Tríceps"
        />
        <Button size="icon" variant="ghost" className="ml-auto" onClick={onRemoveDay}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {!day.exercises.length && <p className="text-sm text-muted-foreground">Nenhum exercício adicionado ainda.</p>}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={day.exercises.map((e) => e.uid)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {day.exercises.map((item) => (
                <SortableExerciseItem key={item.uid} item={item} onChange={updateExercise} onRemove={removeExercise} onSubstitute={setSubstitutingUid} />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
          <Plus className="h-4 w-4" /> Adicionar exercícios
        </Button>

        <ExercisePickerDialog
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          exercises={exercisesLibrary}
          multiple
          onSelectMany={addExercises}
          description="Selecione vários exercícios e adicione todos de uma vez."
        />

        <ExercisePickerDialog
          open={!!substitutingUid}
          onOpenChange={(v) => !v && setSubstitutingUid(null)}
          exercises={exercisesLibrary.filter((ex) => ex.id !== substitutingExercise?.exercise_id)}
          onSelect={handleSubstituteSelect}
          initialCategory={substitutingExercise?.category ?? 'Todas'}
          title="Substituir exercício"
          description={`Sugestões do mesmo grupo muscular para trocar "${substitutingExercise?.name}" (ex: por lesão ou falta de equipamento).`}
        />
      </CardContent>
    </Card>
  );
}
