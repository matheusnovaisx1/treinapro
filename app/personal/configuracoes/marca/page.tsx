import { createClient } from '@/lib/supabase/server';
import { BrandSettingsForm } from '@/components/personal/brand-settings-form';

export default async function MarcaPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('phone, bio, brand_color, brand_logo_url, public_slug, is_public_page_enabled')
    .eq('id', user!.id)
    .single();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Marca e página pública</h1>
        <p className="text-sm text-muted-foreground">Personalize a experiência dos seus alunos e capte novos alunos.</p>
      </div>
      <BrandSettingsForm
        userId={user!.id}
        initial={{
          phone: profile?.phone ?? null,
          bio: profile?.bio ?? null,
          brand_color: profile?.brand_color ?? null,
          brand_logo_url: profile?.brand_logo_url ?? null,
          public_slug: profile?.public_slug ?? null,
          is_public_page_enabled: profile?.is_public_page_enabled ?? false,
        }}
      />
    </div>
  );
}
