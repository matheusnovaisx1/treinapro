import Link from 'next/link';
import { LayoutTemplate, Plus, Pencil } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AssignTemplateDialog, type AssignStudent } from '@/components/personal/assign-template-dialog';
import { DeleteTemplateButton } from '@/components/personal/delete-template-button';

export default async function TemplatesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: templates }, { data: students }] = await Promise.all([
    supabase
      .from('workout_templates')
      .select('id, name, days')
      .eq('personal_id', user!.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('students')
      .select('id, profile:profiles!students_profile_id_fkey(full_name, avatar_url)')
      .eq('personal_id', user!.id)
      .eq('status', 'active'),
  ]);

  const studentList: AssignStudent[] = (students ?? []).map((s) => {
    const p = s.profile as any;
    return { id: s.id, name: p?.full_name ?? 'Aluno', avatar: p?.avatar_url ?? null };
  });

  const list = templates ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Modelos de treino</h1>
          <p className="text-sm text-muted-foreground">
            Monte uma rotina uma vez e aplique para vários alunos de uma vez.
          </p>
        </div>
        <Button variant="accent" asChild>
          <Link href="/personal/templates/novo">
            <Plus className="h-4 w-4" /> Novo modelo
          </Link>
        </Button>
      </div>

      {list.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((t) => {
            const days = (t.days as any[]) ?? [];
            const exerciseCount = days.reduce((sum, d) => sum + ((d.exercises as any[])?.length ?? 0), 0);
            return (
              <Card key={t.id}>
                <CardContent className="flex flex-col gap-4 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <LayoutTemplate className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {days.length} dia(s) · {exerciseCount} exercício(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <AssignTemplateDialog
                      templateId={t.id}
                      templateName={t.name}
                      templateDays={t.days}
                      personalId={user!.id}
                      students={studentList}
                    />
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/personal/templates/${t.id}/editar`}>
                        <Pencil className="h-4 w-4" /> Editar
                      </Link>
                    </Button>
                    <DeleteTemplateButton templateId={t.id} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <LayoutTemplate className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium">Nenhum modelo ainda</p>
              <p className="text-sm text-muted-foreground">
                Crie um modelo de treino para reaproveitar com vários alunos.
              </p>
            </div>
            <Button variant="accent" asChild>
              <Link href="/personal/templates/novo">
                <Plus className="h-4 w-4" /> Novo modelo
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
