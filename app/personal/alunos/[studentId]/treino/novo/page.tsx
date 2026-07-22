import { notFound } from 'next/navigation';
import { nanoid } from 'nanoid';
import { createClient } from '@/lib/supabase/server';
import { WorkoutBuilder } from '@/components/personal/workout-builder';

export default async function NovoTreinoPage({
  params,
  searchParams,
}: {
  params: { studentId: string };
  searchParams: { clone?: string };
}) {
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

  const { data: exercises } = await supabase
    .from('exercises')
    .select('id, name, category, muscle_group, equipment, video_url, is_public, created_by')
    .order('name');

  let initialWorkout;
  if (searchParams.clone) {
    const { data: source } = await supabase.from('workouts').select('*').eq('id', searchParams.clone).single();
    if (source) {
      initialWorkout = {
        name: `${source.name} (cópia)`,
        start_date: null,
        end_date: null,
        is_extra: source.is_extra,
        days: (source.days as any[]).map((d) => ({
          key: d.key,
          label: d.label,
          exercises: (d.exercises as any[]).map((e) => ({ ...e, uid: nanoid(8) })),
        })),
      };
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">{searchParams.clone ? 'Clonar treino' : 'Novo treino'}</h1>
        <p className="text-sm text-muted-foreground">Monte a rotina selecionando exercícios da biblioteca e arraste para reordenar.</p>
      </div>
      <WorkoutBuilder studentId={params.studentId} personalId={user!.id} exercisesLibrary={(exercises as any) ?? []} initialWorkout={initialWorkout} />
    </div>
  );
}
