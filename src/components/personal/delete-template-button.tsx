'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

export function DeleteTemplateButton({ templateId }: { templateId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const { error } = await supabase.from('workout_templates').delete().eq('id', templateId);
    setDeleting(false);
    if (error) {
      toast.error('Não foi possível excluir', { description: error.message });
      return;
    }
    toast.success('Modelo excluído');
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <Button size="sm" variant="destructive" onClick={handleDelete} disabled={deleting}>
          {deleting ? 'Excluindo…' : 'Confirmar'}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setConfirming(false)} disabled={deleting}>
          Cancelar
        </Button>
      </div>
    );
  }

  return (
    <Button size="sm" variant="ghost" onClick={() => setConfirming(true)}>
      <Trash2 className="h-4 w-4 text-destructive" /> Excluir
    </Button>
  );
}
