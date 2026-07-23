'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trophy } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function inDaysISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function CreateChallengeDialog() {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState(todayISO());
  const [end, setEnd] = useState(inDaysISO(30));
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!name.trim()) {
      toast.error('Dê um nome ao desafio');
      return;
    }
    if (end < start) {
      toast.error('A data final deve ser depois da inicial');
      return;
    }
    setSaving(true);
    const { error } = await supabase.rpc('create_challenge', {
      p_name: name.trim(),
      p_description: description.trim() || null,
      p_start: start,
      p_end: end,
    });
    setSaving(false);

    if (error) {
      toast.error('Não foi possível criar o desafio', { description: error.message });
      return;
    }
    toast.success('Desafio criado! Todos os alunos ativos entraram.');
    setOpen(false);
    setName('');
    setDescription('');
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="accent">
          <Trophy className="h-4 w-4" /> Novo desafio
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo desafio</DialogTitle>
          <DialogDescription>
            Todos os seus alunos ativos entram automaticamente. O ranking conta os treinos concluídos no
            período.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input
              placeholder="Ex.: Desafio de Agosto 💪"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Descrição (opcional)</Label>
            <Input
              placeholder="Ex.: quem treinar mais vezes ganha um bônus"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={120}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Início</Label>
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Fim</Label>
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="accent" onClick={handleCreate} disabled={saving}>
            {saving ? 'Criando…' : 'Criar desafio'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
