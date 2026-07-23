import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PersonalSidebar } from '@/components/personal/sidebar';

export default async function PersonalLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role, plan').eq('id', user.id).single();

  if (!profile) redirect('/login');
  if (profile.role !== 'personal') redirect('/aluno/dashboard');

  return (
    <div className="flex min-h-screen flex-col bg-secondary/40 lg:flex-row">
      <PersonalSidebar plan={profile.plan} />
      <div className="min-w-0 flex-1 overflow-y-auto">
        <main className="container max-w-6xl py-8">{children}</main>
      </div>
    </div>
  );
}
