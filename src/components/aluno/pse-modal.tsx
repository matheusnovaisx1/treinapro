'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, PartyPopper, Share2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { shareWorkoutImage } from '@/lib/share';

const pseLabels: Record<number, string> = {
  0: 'Repouso total',
  2: 'Muito leve',
  4: 'Leve',
  6: 'Moderado',
  8: 'Intenso',
  10: 'Esforço máximo',
};

export function PseModal({
  open,
  onOpenChange,
  workoutId,
  studentId,
  dayKey,
  dayLabel,
  exerciseCount,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  workoutId: string;
  studentId: string;
  dayKey: string;
  dayLabel: string;
  exerciseCount: number;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [pse, setPse] = useState(5);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  // 'form' = escolher PSE; 'done' = concluído, mostra opção de compartilhar.
  const [step, setStep] = useState<'form' | 'done'>('form');

  function goToDashboard() {
    onOpenChange(false);
    router.push('/aluno/dashboard');
    router.refresh();
  }

  async function handleSubmit() {
    setSaving(true);
    const { error } = await supabase.from('workout_logs').insert({
      workout_id: workoutId,
      student_id: studentId,
      day_key: dayKey,
      pse,
      comment: comment || null,
    });
    setSaving(false);

    if (error) {
      toast.error('Não foi possível registrar seu treino', { description: error.message });
      return;
    }

    toast.success('Treino registrado! Bom trabalho 💪');
    setStep('done');
  }

  const [sharing, setSharing] = useState(false);
  async function handleShare() {
    setSharing(true);
    const result = await shareWorkoutImage({ dayLabel, exerciseCount, pse });
    setSharing(false);
    if (result === 'downloaded') toast.success('Imagem baixada! Poste no seu app favorito.');
    else if (result === 'copied') toast.success('Resumo copiado! Cole onde quiser postar.');
    else if (result === 'unsupported') toast.error('Seu navegador não permite compartilhar por aqui.');
  }

  // Fechar pelo X/overlay depois de concluído também leva ao início.
  function handleOpenChange(v: boolean) {
    if (!v && step === 'done') {
      goToDashboard();
      return;
    }
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {step === 'form' ? (
          <>
            <DialogHeader>
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                <PartyPopper className="h-5 w-5" />
              </div>
              <DialogTitle className="text-center">Treino concluído!</DialogTitle>
              <DialogDescription className="text-center">Como foi seu nível de esforço percebido (PSE)?</DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={pse}
                onChange={(e) => setPse(Number(e.target.value))}
                className="w-full accent-accent"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span className={cn('text-base font-bold text-foreground')}>{pse}</span>
                <span>10</span>
              </div>
              <p className="text-center text-sm text-muted-foreground">{pseLabels[Math.round(pse / 2) * 2] ?? ''}</p>
            </div>

            <div className="space-y-1.5">
              <Label>Comentário (opcional)</Label>
              <textarea
                className="min-h-[80px] w-full rounded-md border border-input bg-transparent p-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Como você se sentiu hoje?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button variant="accent" onClick={handleSubmit} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Enviar feedback
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-2xl">
                🎉
              </div>
              <DialogTitle className="text-center">Mandou bem!</DialogTitle>
              <DialogDescription className="text-center">
                Treino registrado. Que tal mostrar pra galera que você treinou hoje?
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2">
              <Button variant="accent" onClick={handleShare} disabled={sharing}>
                <Share2 className="h-4 w-4" /> {sharing ? 'Gerando imagem…' : 'Compartilhar treino'}
              </Button>
              <Button variant="ghost" onClick={goToDashboard}>
                Voltar ao início
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
