import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Dumbbell, MessageCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { initials } from '@/lib/utils';
import { whatsappLink } from '@/lib/whatsapp';

export default async function PublicPersonalPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  // Consulta a view pública `public_personal_profiles`, que já expõe apenas
  // colunas seguras — nunca dados sensíveis como e-mail, stripe_customer_id etc.
  const { data: personal } = await supabase.from('public_personal_profiles').select('*').eq('public_slug', params.slug).maybeSingle();

  if (!personal) notFound();

  return (
    <main className="min-h-screen bg-secondary/40">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-primary">
            <Dumbbell className="h-5 w-5" /> TreinaPro
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/cadastro">Sou personal, quero minha página</Link>
          </Button>
        </div>
      </header>

      <div className="container max-w-lg py-16">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={personal.avatar_url ?? undefined} />
              <AvatarFallback className="text-2xl">{initials(personal.full_name)}</AvatarFallback>
            </Avatar>
            <h1 className="font-display text-2xl font-bold">{personal.full_name}</h1>
            {personal.bio && <p className="text-sm text-muted-foreground">{personal.bio}</p>}

            {personal.phone ? (
              <Button size="lg" variant="accent" asChild>
                <a
                  href={whatsappLink(personal.phone, `Olá ${personal.full_name?.split(' ')[0] ?? ''}! Vi sua página no TreinaPro e quero saber mais sobre treinar com você.`)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="h-5 w-5" /> Quero ser seu aluno
                </a>
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">Entre em contato para saber mais.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
