import { createClient } from '@/lib/supabase/server';
import { TemplateBuilder } from '@/components/personal/template-builder';

export default async function NovoTemplatePage() {
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
        <h1 className="font-display text-2xl font-bold">Novo modelo de treino</h1>
        <p className="text-sm text-muted-foreground">
          Monte a rotina uma vez. Depois você atribui para vários alunos de uma vez.
        </p>
      </div>
      <TemplateBuilder personalId={user!.id} exercisesLibrary={(exercises as any) ?? []} />
    </div>
  );
}
