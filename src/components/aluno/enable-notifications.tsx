'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Bell, BellRing, BellOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

type State = 'loading' | 'unsupported' | 'default' | 'granted' | 'denied';

export function EnableNotifications() {
  const [state, setState] = useState<State>('loading');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && !!VAPID_PUBLIC;
    if (!supported) {
      setState('unsupported');
      return;
    }
    setState(Notification.permission as State);
  }, []);

  async function enable() {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setState(permission as State);
        if (permission === 'denied') toast.error('Notificações bloqueadas nas configurações do navegador.');
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC!) as BufferSource,
      });

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) throw new Error('save failed');

      setState('granted');
      toast.success('Lembretes ativados! 🔔');
    } catch (err) {
      toast.error('Não foi possível ativar as notificações.');
    } finally {
      setBusy(false);
    }
  }

  // Não mostra o card quando não dá pra usar ou já está ativo.
  if (state === 'loading' || state === 'unsupported' || state === 'granted') return null;

  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
          {state === 'denied' ? <BellOff className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">Ativar lembretes de treino</p>
          <p className="text-sm text-muted-foreground">
            {state === 'denied'
              ? 'Notificações bloqueadas. Libere nas configurações do navegador para receber lembretes.'
              : 'Receba um lembrete do treino do dia e avisos dos desafios.'}
          </p>
        </div>
        {state !== 'denied' && (
          <Button variant="accent" size="sm" onClick={enable} disabled={busy}>
            <BellRing className="h-4 w-4" /> {busy ? 'Ativando…' : 'Ativar'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
