'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Loader2, Save } from 'lucide-react';
import { nanoid } from 'nanoid';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkoutDayEditor, type WorkoutDay } from '@/components/personal/workout-day-editor';
import type { ExerciseRow } from '@/components/personal/exercise-grid';

const DAY_LETTERS = 'ABCDEFGH';

export function WorkoutBuilder({
  studentId,
  personalId,
  exercisesLibrary,
  initialWorkout,
}: {
  studentId: string;
  personalId: string;
  exercisesLibrary: ExerciseRow[];
  initialWorkout?: {
    name: string;
    start_date: string | null;
    end_date: string | null;
    is_extra: boolean;
    days: WorkoutDay[];
  };
}) {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState(initialWorkout?.name ?? '');
  const [startDate, setStartDate] = useState(initialWorkout?.start_date ?? '');
  const [endDate, setEndDate] = useState(initialWorkout?.end_date ?? '');
  const [isExtra, setIsExtra] = useState(initialWorkout?.is_extra ?? false);
  const [days, setDays] = useState<WorkoutDay[]>(
    initialWorkout?.days ?? [{ key: 'A', label: 'Treino A', exercises: [] }]
  );
  const [saving, setSaving] = useState(false);

  function addDay() {
    const nextLetter = DAY_LETTERS[days.length] ?? String(days.length + 1);
    setDays((d) => [...d, { key: nextLetter, label: `Treino ${nextLetter}`, exercises: [] }]);
  }

  function updateDay(index: number, day: WorkoutDay) {
    setDays((d) => d.map((existing, i) => (i === index ? day : existing)));
  }

  function removeDay(index: number) {
    setDays((d) => d.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error('Dê um nome para a rotina de treino');
      return;
    }
    if (!days.length) {
      toast.error('Adicione ao menos um dia de treino');
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('workouts').insert({
      personal_id: personalId,
      student_id: studentId,
      name,
      start_date: startDate || null,
      end_date: endDate || null,
      is_extra: isExtra,
      is_active: true,
      days: days.map((d) => ({
        key: d.key,
        label: d.label,
        exercises: d.exercises.map((e, i) => ({ ...e, order: i })),
      })),
    });
    setSaving(false);

    if (error) {
      toast.error('Não foi possível salvar o treino', { description: error.message });
      return;
    }

    toast.success('Treino criado com sucesso');
    router.push(`/personal/alunos/${studentId}`);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Detalhes da rotina</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Nome da rotina</Label>
            <Input placeholder="Ex: Hipertrofia - Fase 1" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Data de início</Label>
            <Input type="date" value={startDate ?? ''} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Data de fim</Label>
            <Input type="date" value={endDate ?? ''} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="flex items-center gap-3 sm:col-span-2">
            <Switch checked={isExtra} onCheckedChange={setIsExtra} id="is-extra" />
            <Label htmlFor="is-extra">Treino extra (avulso, fora da rotina vigente)</Label>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {days.map((day, i) => (
          <WorkoutDayEditor
            key={day.key + i}
            day={day}
            exercisesLibrary={exercisesLibrary}
            onChange={(d) => updateDay(i, d)}
            onRemoveDay={() => removeDay(i)}
          />
        ))}
        <Button variant="outline" onClick={addDay}>
          <Plus className="h-4 w-4" /> Adicionar dia de treino
        </Button>
      </div>

      <div className="flex justify-end">
        <Button variant="accent" size="lg" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar rotina de treino
        </Button>
      </div>
    </div>
  );
}
