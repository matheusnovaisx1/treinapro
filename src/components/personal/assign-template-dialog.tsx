'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Users, Check } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, initials } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export type AssignStudent = { id: string; name: string; avatar: string | null };

export function AssignTemplateDialog({
  templateId,
  templateName,
  templateDays,
  personalId,
  students,
}: {
  templateId: string;
  templateName: string;
  templateDays: unknown;
  personalId: string;
  students: AssignStudent[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(templateName);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected((prev) => (prev.size === students.length ? new Set() : new Set(students.map((s) => s.id))));
  }

  async function handleAssign() {
    if (!name.trim()) {
      toast.error('Dê um nome para a rotina');
      return;
    }
    if (selected.size === 0) {
      toast.error('Selecione ao menos um aluno');
      return;
    }

    setSaving(true);
    const rows = Array.from(selected).map((studentId) => ({
      personal_id: personalId,
      student_id: studentId,
      name: name.trim(),
      days: templateDays,
      is_active: true,
    }));
    const { error } = await supabase.from('workouts').insert(rows);
    setSaving(false);

    if (error) {
      toast.error('Não foi possível atribuir o modelo', { description: error.message });
      return;
    }

    toast.success(`Treino atribuído a ${selected.size} aluno${selected.size === 1 ? '' : 's'}!`);
    setOpen(false);
    setSelected(new Set());
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="accent">
          <Users className="h-4 w-4" /> Atribuir
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Atribuir modelo</DialogTitle>
          <DialogDescription>Cria uma rotina a partir de “{templateName}” para os alunos escolhidos.</DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label>Nome da rotina para os alunos</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Alunos</span>
          {students.length > 0 && (
            <Button size="sm" variant="ghost" onClick={selectAll}>
              {selected.size === students.length ? 'Limpar' : 'Selecionar todos'}
            </Button>
          )}
        </div>

        <div className="-mx-1 flex-1 space-y-1.5 overflow-y-auto px-1">
          {students.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">Nenhum aluno ativo.</p>
          )}
          {students.map((s) => {
            const isSel = selected.has(s.id);
            return (
              <button
                key={s.id}
                onClick={() => toggle(s.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors',
                  isSel ? 'border-accent bg-accent/5' : 'border-border hover:bg-muted'
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={s.avatar ?? undefined} />
                  <AvatarFallback className="text-xs">{initials(s.name)}</AvatarFallback>
                </Avatar>
                <span className="flex-1 truncate text-sm font-medium">{s.name}</span>
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full border',
                    isSel ? 'border-accent bg-accent text-accent-foreground' : 'border-input'
                  )}
                >
                  {isSel && <Check className="h-3.5 w-3.5" />}
                </span>
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="accent" onClick={handleAssign} disabled={saving}>
            {saving ? 'Atribuindo…' : `Atribuir a ${selected.size || ''} aluno${selected.size === 1 ? '' : 's'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
