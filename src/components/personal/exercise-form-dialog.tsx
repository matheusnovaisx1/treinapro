'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const categories = ['Peito', 'Costas', 'Ombro', 'Bíceps', 'Tríceps', 'Perna', 'Glúteo', 'Core', 'Cardio'];

export function ExerciseFormDialog({ onCreated }: { onCreated?: () => void }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', category: categories[0], muscle_group: '', equipment: '', video_url: '', instructions: '' });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error('Informe o nome do exercício');
      return;
    }
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from('exercises').insert({
      name: form.name,
      category: form.category,
      muscle_group: form.muscle_group || null,
      equipment: form.equipment || null,
      video_url: form.video_url || null,
      instructions: form.instructions || null,
      is_public: false,
      created_by: user!.id,
    });
    setSaving(false);

    if (error) {
      toast.error('Não foi possível salvar o exercício', { description: error.message });
      return;
    }

    toast.success('Exercício adicionado à sua biblioteca');
    setOpen(false);
    setForm({ name: '', category: categories[0], muscle_group: '', equipment: '', video_url: '', instructions: '' });
    onCreated?.();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="accent">
          <Plus className="h-4 w-4" /> Novo exercício
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo exercício</DialogTitle>
          <DialogDescription>Adicione um exercício próprio à sua biblioteca.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input placeholder="Ex: Supino reto com barra" value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Select value={form.category} onValueChange={(v) => set('category', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Equipamento</Label>
              <Input placeholder="Barra, halteres..." value={form.equipment} onChange={(e) => set('equipment', e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Grupo muscular</Label>
            <Input placeholder="Ex: Peitoral maior" value={form.muscle_group} onChange={(e) => set('muscle_group', e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Link do YouTube (opcional)</Label>
            <Input placeholder="https://youtube.com/watch?v=..." value={form.video_url} onChange={(e) => set('video_url', e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Instruções (opcional)</Label>
            <textarea
              className="min-h-[80px] w-full rounded-md border border-input bg-transparent p-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={form.instructions}
              onChange={(e) => set('instructions', e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="accent" onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar exercício
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
