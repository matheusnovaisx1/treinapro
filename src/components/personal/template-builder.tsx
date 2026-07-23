'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Loader2, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkoutDayEditor, type WorkoutDay } from '@/components/personal/workout-day-editor';
import type { ExerciseRow } from '@/components/personal/exercise-grid';

const DAY_LETTERS = 'ABCDEFGH';

export function TemplateBuilder({
  personalId,
  exercisesLibrary,
  initialTemplate,
  templateId,
}: {
  personalId: string;
  exercisesLibrary: ExerciseRow[];
  initialTemplate?: { name: string; days: WorkoutDay[] };
  templateId?: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState(initialTemplate?.name ?? '');
  const [days, setDays] = useState<WorkoutDay[]>(
    initialTemplate?.days ?? [{ key: 'A', label: 'Treino A', exercises: [] }]
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
      toast.error('Dê um nome ao modelo');
      return;
    }
    if (!days.length) {
      toast.error('Adicione ao menos um dia de treino');
      return;
    }

    setSaving(true);
    const payload = {
      name: name.trim(),
      days: days.map((d) => ({
        key: d.key,
        label: d.label,
        exercises: d.exercises.map((e, i) => ({ ...e, order: i })),
      })),
    };

    const { error } = templateId
      ? await supabase.from('workout_templates').update(payload).eq('id', templateId)
      : await supabase.from('workout_templates').insert({ ...payload, personal_id: personalId });
    setSaving(false);

    if (error) {
      toast.error('Não foi possível salvar o modelo', { description: error.message });
      return;
    }

    toast.success(templateId ? 'Modelo atualizado' : 'Modelo criado');
    router.push('/personal/templates');
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Modelo de treino</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            <Label>Nome do modelo</Label>
            <Input placeholder="Ex: Full Body Iniciante" value={name} onChange={(e) => setName(e.target.value)} />
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
          Salvar modelo
        </Button>
      </div>
    </div>
  );
}
