'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { CreateChallengeDialog } from '@/components/personal/create-challenge-dialog';

type Challenge = { id: string; name: string; description: string | null; start_date: string; end_date: string };

export function ChallengeActions({ challenge }: { challenge: Challenge }) {
  const router = useRouter();
  const supabase = createClient();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const { error } = await supabase.from('challenges').delete().eq('id', challenge.id);
    setDeleting(false);
    if (error) {
      toast.error('Não foi possível excluir', { description: error.message });
      return;
    }
    toast.success('Desafio excluído');
    setConfirming(false);
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
    <div className="flex items-center gap-1">
      <CreateChallengeDialog
        challenge={challenge}
        trigger={
          <Button size="icon" variant="ghost" aria-label="Editar desafio">
            <Pencil className="h-4 w-4" />
          </Button>
        }
      />
      <Button size="icon" variant="ghost" aria-label="Excluir desafio" onClick={() => setConfirming(true)}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
