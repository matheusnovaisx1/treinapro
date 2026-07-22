'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Question = { id: string; text: string };

export function AnamneseForm({ anamneseId, questions }: { anamneseId: string; questions: Question[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (questions.some((q) => !answers[q.id]?.trim())) {
      toast.error('Responda todas as perguntas antes de enviar');
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('anamneses')
      .update({ answers, status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', anamneseId);
    setSaving(false);

    if (error) {
      toast.error('Não foi possível enviar', { description: error.message });
      return;
    }

    toast.success('Anamnese enviada ao seu personal');
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Responda com atenção</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {questions.map((q, i) => (
          <div key={q.id} className="space-y-1.5">
            <Label>
              {i + 1}. {q.text}
            </Label>
            <textarea
              className="min-h-[70px] w-full rounded-md border border-input bg-transparent p-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={answers[q.id] ?? ''}
              onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
              placeholder="Sua resposta..."
            />
          </div>
        ))}
        <Button variant="accent" onClick={handleSubmit} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Enviar respostas
        </Button>
      </CardContent>
    </Card>
  );
}
