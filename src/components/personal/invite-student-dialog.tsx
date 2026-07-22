'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UserPlus, Loader2, Copy, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UpgradeModal } from '@/components/personal/upgrade-modal';
import type { PlanId } from '@/lib/plans';

export function InviteStudentDialog({ currentPlan = 'free' }: { currentPlan?: PlanId }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleCreateInvite() {
    setLoading(true);
    const res = await fetch('/api/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email || undefined }),
    });
    const body = await res.json();
    setLoading(false);

    if (res.status === 402) {
      setOpen(false);
      setUpgradeOpen(true);
      return;
    }
    if (!res.ok) {
      toast.error('Não foi possível gerar o convite', { description: body.error });
      return;
    }

    setInviteUrl(body.inviteUrl);
  }

  function handleCopy() {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(false), 2000);
  }

  function handleClose(v: boolean) {
    setOpen(v);
    if (!v) {
      setInviteUrl(null);
      setEmail('');
      router.refresh();
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogTrigger asChild>
          <Button variant="accent">
            <UserPlus className="h-4 w-4" /> Convidar aluno
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar novo aluno</DialogTitle>
            <DialogDescription>
              Gere um link único de cadastro. O aluno usa o link para criar a própria conta,
              já vinculada a você.
            </DialogDescription>
          </DialogHeader>

          {!inviteUrl ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="invite-email">E-mail do aluno (opcional)</Label>
                <Input id="invite-email" type="email" placeholder="aluno@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <DialogFooter>
                <Button variant="accent" onClick={handleCreateInvite} disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Gerar link de convite
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
                <span className="flex-1 truncate text-sm">{inviteUrl}</span>
                <Button size="icon" variant="ghost" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Válido por 7 dias. Envie por WhatsApp, e-mail ou onde preferir.</p>
              <DialogFooter>
                <Button variant="outline" onClick={() => handleClose(false)}>
                  Concluir
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} currentPlan={currentPlan} />
    </>
  );
}
