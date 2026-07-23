import Link from 'next/link';
import { ArrowRight, Dumbbell, LineChart, ClipboardList, MessageSquare, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PLAN_TIERS } from '@/lib/plans';
import { formatCurrencyBRL } from '@/lib/utils';

const features = [
  {
    icon: ClipboardList,
    title: 'Anamnese e avaliações',
    description: 'Envie o PAR-Q ou modelos próprios, receba fotos e medidas e acompanhe a evolução física do aluno.',
  },
  {
    icon: Dumbbell,
    title: 'Montador de treinos',
    description: 'Monte rotinas por dia da semana com uma biblioteca de mais de 1.800 exercícios e vídeos.',
  },
  {
    icon: LineChart,
    title: 'Evolução em gráficos',
    description: 'Cargas, medidas e percentual de gordura plotados automaticamente a cada feedback registrado.',
  },
  {
    icon: MessageSquare,
    title: 'Chat direto com o aluno',
    description: 'Tire dúvidas e ajuste treinos em tempo real, sem sair da plataforma.',
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <span className="font-display text-lg font-bold text-primary">TreinaPro</span>
          <nav className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button variant="accent" asChild>
              <Link href="/cadastro">Começar grátis</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(600px circle at 15% 20%, hsl(20 90% 48% / 0.35), transparent 60%), radial-gradient(500px circle at 85% 75%, hsl(142 70% 38% / 0.3), transparent 60%)',
          }}
        />
        <div className="container relative grid gap-12 py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-accent">
              Feito para personal trainers
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              O treino do seu aluno, do jeito que ele acompanha: no bolso, todo dia.
            </h1>
            <p className="mt-5 max-w-lg text-white/80">
              Anamnese, avaliação física, treino e evolução em um só lugar. Comece com 1 aluno de
              graça — sem cartão de crédito.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" variant="accent" asChild>
                <Link href="/cadastro">
                  Criar conta grátis <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10" asChild>
                <Link href="#precos">Ver planos</Link>
              </Button>
            </div>
          </div>

          {/* Signature element: mock "treino do dia" card, the actual product content.
              Sempre clara (mockup de dispositivo), então isolamos as CSS vars aqui
              em modo claro — independente do tema escuro do resto do app. */}
          <div
            className="mx-auto w-full max-w-sm"
            style={
              {
                '--background': '0 0% 100%',
                '--foreground': '217 45% 12%',
                '--card': '0 0% 100%',
                '--card-foreground': '217 45% 12%',
                '--muted': '210 25% 96%',
                '--muted-foreground': '215 16% 47%',
              } as React.CSSProperties
            }
          >
            <Card className="rotate-1 border-black/5 bg-white text-foreground shadow-xl">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Treino de hoje</span>
                  <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">Treino B</span>
                </div>
                <h3 className="mt-2 font-display text-lg font-bold">Costas &amp; Bíceps</h3>
                <ul className="mt-4 space-y-3">
                  {[
                    ['Puxada frente', '4x12'],
                    ['Remada curvada', '4x10'],
                    ['Rosca direta', '3x12'],
                  ].map(([name, sets]) => (
                    <li key={name} className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
                      <span className="font-medium">{name}</span>
                      <span className="text-muted-foreground">{sets}</span>
                    </li>
                  ))}
                </ul>
                <Button className="mt-5 w-full" variant="accent">
                  Iniciar treino
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <h2 className="text-center font-display text-3xl font-bold">Tudo que você precisa para acompanhar seus alunos</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <CardContent className="p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="precos" className="bg-secondary py-20">
        <div className="container">
          <h2 className="text-center font-display text-3xl font-bold">Planos simples, sem pegadinha</h2>
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
            {PLAN_TIERS.map((plan) => (
              <Card key={plan.id} className={plan.id === 'pro' ? 'border-accent shadow-md' : undefined}>
                <CardContent className="flex h-full flex-col p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
                    {plan.id === 'pro' && (
                      <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                        Mais popular
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {plan.studentLimit ? `Até ${plan.studentLimit} aluno${plan.studentLimit > 1 ? 's' : ''} ativo${plan.studentLimit > 1 ? 's' : ''}` : 'Alunos ilimitados'}
                  </p>
                  <p className="mt-4 font-display text-3xl font-bold">
                    {plan.price === 0 ? 'R$ 0' : formatCurrencyBRL(plan.price)}
                    {plan.price > 0 && <span className="text-base font-normal text-muted-foreground">/mês</span>}
                  </p>
                  <ul className="mt-6 flex-1 space-y-2 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-success" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button variant={plan.id === 'free' ? 'outline' : 'accent'} className="mt-6 w-full" asChild>
                    <Link href="/cadastro">{plan.id === 'free' ? 'Começar grátis' : `Assinar ${plan.name}`}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} TreinaPro.</span>
          <div className="flex items-center gap-4">
            <Link href="/termos" className="hover:underline">
              Termos de Uso
            </Link>
            <Link href="/privacidade" className="hover:underline">
              Privacidade
            </Link>
            <Link href="/cancelamento" className="hover:underline">
              Cancelamento
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
