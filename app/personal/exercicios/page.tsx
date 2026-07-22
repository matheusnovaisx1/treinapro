import { createClient } from '@/lib/supabase/server';
import { ExerciseLibrary } from '@/components/personal/exercise-library';

export default async function ExerciciosPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: exercises } = await supabase
    .from('exercises')
    .select('id, name, category, muscle_group, equipment, video_url, is_public, created_by')
    .order('name');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Biblioteca de exercícios</h1>
        <p className="text-sm text-muted-foreground">
          Exercícios públicos da plataforma + os que você cadastrou. Use-os no montador de treinos.
        </p>
      </div>
      <ExerciseLibrary exercises={(exercises as any) ?? []} currentUserId={user!.id} />
    </div>
  );
}
