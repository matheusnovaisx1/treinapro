import { createClient } from '@/lib/supabase/server';
import { ChatThread } from '@/components/chat/chat-thread';
import { Card, CardContent } from '@/components/ui/card';

export default async function AlunoChatPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from('profiles').select('personal_id').eq('id', user!.id).single();

  if (!profile?.personal_id) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Você ainda não está vinculado a um personal trainer.
        </CardContent>
      </Card>
    );
  }

  const { data: personal } = await supabase.from('profiles').select('full_name').eq('id', profile.personal_id).single();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Chat</h1>
      <ChatThread currentUserId={user!.id} otherUserId={profile.personal_id} otherName={personal?.full_name ?? 'Seu personal'} />
    </div>
  );
}
