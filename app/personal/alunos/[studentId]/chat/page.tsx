import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ChatThread } from '@/components/chat/chat-thread';

export default async function PersonalChatPage({ params }: { params: { studentId: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: student } = await supabase
    .from('students')
    .select('id, profile:profiles!students_profile_id_fkey(id, full_name)')
    .eq('id', params.studentId)
    .eq('personal_id', user!.id)
    .single();

  if (!student) notFound();
  const profile = student.profile as any;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Chat com {profile?.full_name}</h1>
      <ChatThread currentUserId={user!.id} otherUserId={profile.id} otherName={profile?.full_name ?? 'Aluno'} />
    </div>
  );
}
