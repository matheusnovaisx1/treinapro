'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function StudentNotes({ studentId, initialNotes }: { studentId: string; initialNotes: string | null }) {
  const supabase = createClient();
  const [notes, setNotes] = useState(initialNotes ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase.from('students').update({ notes }).eq('id', studentId);
    setSaving(false);
    if (error) {
      toast.error('Não foi possível salvar as anotações');
      return;
    }
    toast.success('Anotações salvas');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Anotações fixas</CardTitle>
        <CardDescription>Lesões, medicamentos, restrições e outras informações importantes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          placeholder="Ex: hérnia de disco L4-L5, evitar agachamento livre. Usa Losartana."
          className="w-full rounded-md border border-input bg-transparent p-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <Button size="sm" variant="accent" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar
        </Button>
      </CardContent>
    </Card>
  );
}
