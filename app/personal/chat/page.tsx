import Link from 'next/link';
import { MessageSquare, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { initials } from '@/lib/utils';

export default async function PersonalChatListPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: students } = await supabase
    .from('students')
    .select('id, profile:profiles!students_profile_id_fkey(id, full_name, avatar_url)')
    .eq('personal_id', user!.id)
    .eq('status', 'active');

  // Últimas mensagens envolvendo o personal, para prévia + contagem de não lidas.
  const { data: msgs } = await supabase
    .from('messages')
    .select('sender_id, receiver_id, text, created_at, read_at')
    .or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
    .order('created_at', { ascending: false });

  const rows = (students ?? []).map((s) => {
    const profile = s.profile as any;
    const otherId = profile?.id;
    const related = (msgs ?? []).filter((m) => m.sender_id === otherId || m.receiver_id === otherId);
    const last = related[0] ?? null;
    const unread = related.filter((m) => m.receiver_id === user!.id && m.sender_id === otherId && !m.read_at).length;
    return { studentId: s.id, name: profile?.full_name ?? 'Aluno', avatar: profile?.avatar_url as string | null, last, unread };
  });

  // Conversas com mensagem primeiro (mais recentes no topo); depois as sem histórico.
  rows.sort((a, b) => {
    const ta = a.last ? new Date(a.last.created_at).getTime() : 0;
    const tb = b.last ? new Date(b.last.created_at).getTime() : 0;
    return tb - ta;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Conversas</h1>
        <p className="text-sm text-muted-foreground">Fale com seus alunos direto pelo app.</p>
      </div>

      {rows.length ? (
        <div className="space-y-2">
          {rows.map((r) => (
            <Link key={r.studentId} href={`/personal/alunos/${r.studentId}/chat`} className="block">
              <Card className="transition-colors hover:border-accent">
                <CardContent className="flex items-center gap-3 p-3">
                  <Avatar className="h-11 w-11">
                    <AvatarImage src={r.avatar ?? undefined} />
                    <AvatarFallback>{initials(r.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{r.name}</span>
                      {r.unread > 0 && <Badge variant="accent">{r.unread}</Badge>}
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {r.last ? r.last.text : 'Nenhuma mensagem ainda'}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <MessageSquare className="h-6 w-6" />
            </div>
            <p className="text-sm text-muted-foreground">Você ainda não tem alunos ativos para conversar.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
