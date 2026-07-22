import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AlunoSidebar } from '@/components/aluno/sidebar';
import { hexToHslString } from '@/lib/utils';

export default async function AlunoLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role, personal_id').eq('id', user.id).single();
  if (!profile) redirect('/login');
  if (profile.role !== 'aluno') redirect('/personal/dashboard');

  const { data: personal } = profile.personal_id
    ? await supabase.from('profiles').select('brand_color, brand_logo_url, full_name').eq('id', profile.personal_id).single()
    : { data: null };

  const accentHsl = personal?.brand_color ? hexToHslString(personal.brand_color) : null;

  return (
    <div className="flex min-h-screen bg-secondary/40" style={accentHsl ? ({ '--accent': accentHsl, '--ring': accentHsl } as React.CSSProperties) : undefined}>
      <AlunoSidebar brandLogoUrl={personal?.brand_logo_url} brandName={personal?.full_name} />
      <div className="flex-1 overflow-y-auto pb-16 sm:pb-0">
        <main className="container max-w-3xl py-8">{children}</main>
      </div>
    </div>
  );
}
