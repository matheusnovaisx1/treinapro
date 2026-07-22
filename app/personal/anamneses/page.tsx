import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnamneseTemplateDialog } from '@/components/personal/anamnese-template-dialog';

export default async function AnamnesesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: templates } = await supabase
    .from('anamnese_templates')
    .select('*')
    .or(`personal_id.eq.${user!.id},personal_id.is.null`)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Anamneses</h1>
          <p className="text-sm text-muted-foreground">Modelos prontos e personalizados para enviar aos seus alunos.</p>
        </div>
        <AnamneseTemplateDialog />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {templates?.map((t) => (
          <Card key={t.id}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">{t.name}</CardTitle>
              {t.is_default && <Badge variant="secondary">Padrão</Badge>}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{(t.questions as any[]).length} pergunta(s)</p>
              <ul className="mt-2 space-y-1 text-sm">
                {(t.questions as any[]).slice(0, 3).map((q) => (
                  <li key={q.id} className="truncate text-muted-foreground">
                    • {q.text}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Para enviar um modelo a um aluno específico, acesse o perfil do aluno na aba "Anamnese".
      </p>
    </div>
  );
}
