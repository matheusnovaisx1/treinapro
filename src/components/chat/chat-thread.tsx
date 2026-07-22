'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn, initials } from '@/lib/utils';

type Message = { id: string; sender_id: string; receiver_id: string; text: string; created_at: string };

export function ChatThread({ currentUserId, otherUserId, otherName }: { currentUserId: string; otherUserId: string; otherName: string }) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`
        )
        .order('created_at', { ascending: true });

      setMessages((data as any) ?? []);
      setLoading(false);
    }
    loadMessages();

    const channel = supabase
      .channel(`chat-${[currentUserId, otherUserId].sort().join('-')}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new as Message;
        const belongsToThread =
          (msg.sender_id === currentUserId && msg.receiver_id === otherUserId) ||
          (msg.sender_id === otherUserId && msg.receiver_id === currentUserId);
        if (belongsToThread) setMessages((prev) => [...prev, msg]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, otherUserId, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    if (!text.trim()) return;
    setSending(true);
    const { error } = await supabase.from('messages').insert({ sender_id: currentUserId, receiver_id: otherUserId, text: text.trim() });
    setSending(false);
    if (!error) setText('');
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-lg border bg-background">
      <div className="flex items-center gap-3 border-b p-4">
        <Avatar>
          <AvatarFallback>{initials(otherName)}</AvatarFallback>
        </Avatar>
        <span className="font-medium">{otherName}</span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {loading && <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />}
        {!loading && !messages.length && <p className="py-6 text-center text-sm text-muted-foreground">Diga olá 👋</p>}
        {messages.map((m) => (
          <div key={m.id} className={cn('flex', m.sender_id === currentUserId ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[75%] rounded-lg px-3 py-2 text-sm',
                m.sender_id === currentUserId ? 'bg-accent text-accent-foreground' : 'bg-muted'
              )}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 border-t p-3">
        <Input
          placeholder="Escreva uma mensagem..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button size="icon" variant="accent" onClick={handleSend} disabled={sending}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
