'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Dumbbell, ClipboardList, Camera, MessageSquare, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const links = [
  { href: '/aluno/dashboard', label: 'Início', icon: LayoutDashboard },
  { href: '/aluno/treinos', label: 'Treinos', icon: Dumbbell },
  { href: '/aluno/anamnese', label: 'Anamnese', icon: ClipboardList },
  { href: '/aluno/avaliacoes', label: 'Avaliações', icon: Camera },
  { href: '/aluno/chat', label: 'Chat', icon: MessageSquare },
];

export function AlunoSidebar({ brandLogoUrl, brandName }: { brandLogoUrl?: string | null; brandName?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden h-screen w-60 shrink-0 flex-col border-r bg-primary text-primary-foreground sm:flex">
        <div className="flex h-16 items-center gap-2 px-5">
          {brandLogoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={brandLogoUrl} alt={brandName ?? 'Logo'} className="h-8 w-8 rounded-md object-cover" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent">
              <Dumbbell className="h-4 w-4" />
            </div>
          )}
          <span className="truncate font-display font-bold">{brandName || 'TreinaPro'}</span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white',
                  active && 'bg-white/10 text-white'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white">
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav — alunos usam muito no celular */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t bg-background sm:hidden">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={cn('flex flex-1 flex-col items-center gap-1 py-2 text-[11px] text-muted-foreground', active && 'text-accent')}>
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
