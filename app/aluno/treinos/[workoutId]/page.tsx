import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { WorkoutRunner } from '@/components/aluno/workout-runner';

export default async function TreinoExecucaoPage({
  params,
  searchParams,
}: {
  params: { workoutId: string };
  searchParams: { day?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: student } = await supabase.from('students').select('id').eq('profile_id', user!.id).single();
  if (!student) notFound();

  const { data: workout } = await supabase.from('workouts').select('*').eq('id', params.workoutId).eq('student_id', student.id).single();
  if (!workout) notFound();

  const days = (workout.days as any[]) ?? [];
  const day = days.find((d) => d.key === searchParams.day) ?? days[0];
  if (!day) notFound();

  const exerciseIds = (day.exercises ?? []).map((e: any) => e.exercise_id);
  const { data: exerciseDetails } = exerciseIds.length
    ? await supabase.from('exercises').select('id, video_url').in('id', exerciseIds)
    : { data: [] as any[] };

  const videoMap = new Map((exerciseDetails ?? []).map((e) => [e.id, e.video_url]));
  const exercises = (day.exercises ?? []).map((e: any) => ({ ...e, video_url: videoMap.get(e.exercise_id) ?? null }));

  return (
    <WorkoutRunner
      workoutId={workout.id}
      studentId={student.id}
      dayKey={day.key}
      dayLabel={day.label}
      exercises={exercises}
    />
  );
}
