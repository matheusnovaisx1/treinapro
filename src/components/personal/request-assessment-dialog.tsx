'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ImagePlus, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const TYPES = [
  { value: 'morfologica', label: 'Morfológica (dobras/medidas)' },
  { value: 'postural', label: 'Postural' },
  { value: 'neuromotora', label: 'Neuromotora' },
  { value: 'fotos', label: 'Fotos de progresso' },
];

export function RequestAssessmentDialog({ studentId }: { studentId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('morfologica');
  const [loading, setLoading] = useState(false);

  async function handleRequest() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from('assessments').insert({
      student_id: studentId,
      type,
      requested: true,
      data: {},
      created_by: user?.id,
    });
    setLoading(false);

    if (error) {
      toast.error('Não foi possível solicitar a avaliação', { description: error.message });
      return;
    }

    toast.success('Solicitação enviada ao aluno');
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="accent">
          <ImagePlus className="h-4 w-4" /> Solicitar avaliação
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Solicitar avaliação</DialogTitle>
          <DialogDescription>O aluno receberá um pedido para enviar fotos/medidas.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label>Tipo de avaliação</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="accent" onClick={handleRequest} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Solicitar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
