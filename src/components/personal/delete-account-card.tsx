'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Danger zone: excluir a própria conta. Confirmação forte (digitar o e-mail).
export function DeleteAccountCard({ email }: { email: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [deleting, setDeleting] = useState(false);

  const matches = confirmEmail.trim().toLowerCase() === email.trim().toLowerCase();

  async function handleDelete() {
    if (!matches) return;
    setDeleting(true);
    const res = await fetch('/api/account/delete', { method: 'POST' });
    if (!res.ok) {
      setDeleting(false);
      const body = await res.json().catch(() => ({}));
      toast.error('Não foi possível excluir a conta', { description: body.detail ?? 'Tente novamente.' });
      return;
    }
    toast.success('Conta excluída. Até logo!');
    router.push('/');
    router.refresh();
  }

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-destructive">
          <AlertTriangle className="h-4 w-4" /> Excluir minha conta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Isso apaga permanentemente sua conta e todos os dados vinculados (alunos, treinos,
          avaliações, mensagens). A assinatura ativa é cancelada. <strong>Não dá para desfazer.</strong>
        </p>

        {!open ? (
          <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10" onClick={() => setOpen(true)}>
            Excluir minha conta
          </Button>
        ) : (
          <div className="space-y-3 rounded-md border border-destructive/40 bg-destructive/5 p-3">
            <div className="space-y-1.5">
              <Label>
                Digite <span className="font-mono">{email}</span> para confirmar
              </Label>
              <Input
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder={email}
                autoComplete="off"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="destructive" onClick={handleDelete} disabled={!matches || deleting}>
                {deleting ? 'Excluindo…' : 'Excluir definitivamente'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setOpen(false);
                  setConfirmEmail('');
                }}
                disabled={deleting}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
