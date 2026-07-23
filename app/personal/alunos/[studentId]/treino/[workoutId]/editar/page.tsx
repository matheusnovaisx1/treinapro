import { notFound } from 'next/navigation';
import { nanoid } from 'nanoid';
import { createClient } from '@/lib/supabase/server';
import { WorkoutBuilder } from '@/components/personal/workout-builder';

export default async function EditarTreinoPage({ params }: { params: { studentId: string; workoutId: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('id', params.studentId)
    .eq('personal_id', user!.id)
    .single();

  if (!student) notFound();

  const { data: workout } = await supabase
    .from('workouts')
    .select('*')
    .eq('id', params.workoutId)
    .eq('student_id', params.studentId)
    .single();

  if (!workout) notFound();

  const { data: exercises } = await supabase
    .from('exercises')
    .select('id, name, category, muscle_group, equipment, video_url, is_public, created_by')
    .order('name');

  // Cada exercício precisa de um uid estável para o drag-and-drop e edição.
  const initialWorkout = {
    name: workout.name,
    start_date: workout.start_date,
    end_date: workout.end_date,
    is_extra: workout.is_extra,
    days: ((workout.days as any[]) ?? []).map((d) => ({
      key: d.key,
      label: d.label,
      exercises: ((d.exercises as any[]) ?? []).map((e) => ({ ...e, uid: e.uid ?? nanoid(8) })),
    })),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Editar treino</h1>
        <p className="text-sm text-muted-foreground">
          Ajuste os exercícios, séries e repetições. Arraste para reordenar.
        </p>
      </div>
      <WorkoutBuilder
        studentId={params.studentId}
        personalId={user!.id}
        exercisesLibrary={(exercises as any) ?? []}
        initialWorkout={initialWorkout}
        workoutId={workout.id}
      />
    </div>
  );
}
