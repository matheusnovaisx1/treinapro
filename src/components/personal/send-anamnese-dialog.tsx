'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

type Template = { id: string; name: string; questions: any };

export function SendAnamneseDialog({ studentId, templates }: { studentId: string; templates: Template[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [templateId, setTemplateId] = useState<string>(templates[0]?.id ?? '');
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    setLoading(true);
    const { error } = await supabase.from('anamneses').insert({
      student_id: studentId,
      template_id: template.id,
      questions: template.questions,
      status: 'pending',
    });
    setLoading(false);

    if (error) {
      toast.error('Não foi possível enviar a anamnese', { description: error.message });
      return;
    }

    toast.success('Anamnese enviada ao aluno');
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="accent">
          <Send className="h-4 w-4" /> Enviar anamnese
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar anamnese</DialogTitle>
          <DialogDescription>Escolha um modelo para o aluno preencher.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label>Modelo</Label>
          <Select value={templateId} onValueChange={setTemplateId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um modelo" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="accent" onClick={handleSend} disabled={loading || !templateId}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
