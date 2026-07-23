'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  ClipboardList,
  Settings,
  LogOut,
  Crown,
  Menu,
  X,
  PanelLeftClose,
  PanelLeft,
  Trophy,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { getPlanTier, type PlanId } from '@/lib/plans';

const links = [
  { href: '/personal/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/personal/alunos', label: 'Alunos', icon: Users },
  { href: '/personal/exercicios', label: 'Exercícios', icon: Dumbbell },
  { href: '/personal/anamneses', label: 'Anamneses', icon: ClipboardList },
  { href: '/personal/desafios', label: 'Desafios', icon: Trophy },
  { href: '/personal/configuracoes', label: 'Configurações', icon: Settings },
];

const COLLAPSE_KEY = 'tp_sidebar_collapsed';

export function PersonalSidebar({ plan }: { plan: PlanId }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const tier = getPlanTier(plan);
  const [open, setOpen] = useState(false); // drawer mobile
  const [collapsed, setCollapsed] = useState(false); // recolhida no desktop

  // Lê a preferência salva só no cliente (evita divergência de hidratação).
  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === '1');
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
      return next;
    });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center justify-between gap-2 px-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent">
            <Dumbbell className="h-4 w-4" />
          </div>
          <span className="font-display font-bold">TreinaPro</span>
        </div>
        {/* Fechar — drawer mobile */}
        <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white lg:hidden" aria-label="Fechar menu">
          <X className="h-5 w-5" />
        </button>
        {/* Recolher — só no desktop */}
        <button
          onClick={toggleCollapsed}
          className="hidden text-white/70 hover:text-white lg:block"
          aria-label="Recolher menu"
          title="Recolher menu"
        >
          <PanelLeftClose className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white',
                active && 'bg-white/10 text-white'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-white/10 p-4">
        {plan !== 'premium' ? (
          <Link
            href="/personal/configuracoes/plano"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between rounded-md bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
          >
            <span>Plano {tier.name}</span>
            <Badge variant="accent" className="gap-1">
              <Crown className="h-3 w-3" /> Upgrade
            </Badge>
          </Link>
        ) : (
          <div className="flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm">
            <Crown className="h-4 w-4 text-accent" /> Plano Premium
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Barra superior — só no mobile */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/10 bg-primary px-4 text-primary-foreground lg:hidden">
        <button onClick={() => setOpen(true)} aria-label="Abrir menu">
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent">
            <Dumbbell className="h-3.5 w-3.5" />
          </div>
          <span className="font-display font-bold">TreinaPro</span>
        </div>
      </header>

      {/* Sidebar fixa — desktop. Some quando recolhida. */}
      {!collapsed && (
        <aside className="hidden h-screen w-64 shrink-0 flex-col border-r bg-primary text-primary-foreground lg:sticky lg:top-0 lg:flex">
          {sidebarContent}
        </aside>
      )}

      {/* Botão flutuante para reabrir quando recolhida (desktop) */}
      {collapsed && (
        <button
          onClick={toggleCollapsed}
          className="fixed left-3 top-3 z-30 hidden items-center gap-2 rounded-md border bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-md hover:bg-primary/90 lg:flex"
          aria-label="Abrir menu"
          title="Abrir menu"
        >
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </button>
      )}

      {/* Drawer mobile: overlay + painel deslizante */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} aria-hidden="true" />
          <aside className="absolute inset-y-0 left-0 flex w-64 max-w-[80%] flex-col bg-primary text-primary-foreground shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
