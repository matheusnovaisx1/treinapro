import { notFound } from 'next/navigation';
import { nanoid } from 'nanoid';
import { createClient } from '@/lib/supabase/server';
import { TemplateBuilder } from '@/components/personal/template-builder';

export default async function EditarTemplatePage({ params }: { params: { templateId: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: template } = await supabase
    .from('workout_templates')
    .select('id, name, days')
    .eq('id', params.templateId)
    .eq('personal_id', user!.id)
    .single();

  if (!template) notFound();

  const { data: exercises } = await supabase
    .from('exercises')
    .select('id, name, category, muscle_group, equipment, video_url, is_public, created_by')
    .order('name');

  const initialTemplate = {
    name: template.name,
    days: ((template.days as any[]) ?? []).map((d) => ({
      key: d.key,
      label: d.label,
      exercises: ((d.exercises as any[]) ?? []).map((e) => ({ ...e, uid: e.uid ?? nanoid(8) })),
    })),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Editar modelo</h1>
        <p className="text-sm text-muted-foreground">Ajuste os exercícios do modelo. Alunos já atribuídos não mudam.</p>
      </div>
      <TemplateBuilder
        personalId={user!.id}
        exercisesLibrary={(exercises as any) ?? []}
        initialTemplate={initialTemplate}
        templateId={template.id}
      />
    </div>
  );
}
