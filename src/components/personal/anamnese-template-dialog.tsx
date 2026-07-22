'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';

type Question = { id: string; text: string };

export function AnamneseTemplateDialog() {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [questions, setQuestions] = useState<Question[]>([{ id: nanoid(6), text: '' }]);
  const [saving, setSaving] = useState(false);

  function addQuestion() {
    setQuestions((qs) => [...qs, { id: nanoid(6), text: '' }]);
  }

  function updateQuestion(id: string, text: string) {
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, text } : q)));
  }

  function removeQuestion(id: string) {
    setQuestions((qs) => qs.filter((q) => q.id !== id));
  }

  async function handleSave() {
    if (!name.trim() || questions.some((q) => !q.text.trim())) {
      toast.error('Preencha o nome e todas as perguntas');
      return;
    }
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from('anamnese_templates').insert({
      personal_id: user!.id,
      name,
      questions,
    });
    setSaving(false);

    if (error) {
      toast.error('Não foi possível criar o modelo', { description: error.message });
      return;
    }

    toast.success('Modelo criado');
    setOpen(false);
    setName('');
    setQuestions([{ id: nanoid(6), text: '' }]);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="accent">
          <Plus className="h-4 w-4" /> Novo modelo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo modelo de anamnese</DialogTitle>
          <DialogDescription>Crie uma lista de perguntas personalizadas para seus alunos.</DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label>Nome do modelo</Label>
          <Input placeholder="Ex: Anamnese avançada" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="space-y-3">
          <Label>Perguntas</Label>
          {questions.map((q, i) => (
            <div key={q.id} className="flex items-center gap-2">
              <Input
                placeholder={`Pergunta ${i + 1}`}
                value={q.text}
                onChange={(e) => updateQuestion(q.id, e.target.value)}
              />
              <Button size="icon" variant="ghost" onClick={() => removeQuestion(q.id)} disabled={questions.length === 1}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addQuestion}>
            <Plus className="h-4 w-4" /> Adicionar pergunta
          </Button>
        </div>

        <DialogFooter>
          <Button variant="accent" onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar modelo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
