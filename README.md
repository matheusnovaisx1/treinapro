# TreinaPro — Plataforma de Gestão para Personal Trainers

Aplicação Next.js 14 (App Router) + Supabase + Stripe, inspirada no fluxo do TreinaPro Personal:
personal trainer gerencia alunos, anamneses, avaliações, treinos e feedbacks; aluno acessa
o próprio treino, preenche anamnese, envia avaliações e conversa com o personal.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui (Radix primitives)
- Supabase: Postgres, Auth, Storage, Realtime
- Stripe: assinatura recorrente (Checkout + Webhooks)
- React Hook Form + Zod, React Query, Recharts, dnd-kit

## Estrutura de pastas (planejada — entregue em etapas)

```
mfit-app/
├── app/
│   ├── (marketing)/
│   │   └── page.tsx                    # Landing page
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── cadastro/page.tsx           # Cadastro do personal
│   │   └── convite/[token]/page.tsx    # Aluno aceita convite e cria conta
│   ├── personal/
│   │   ├── layout.tsx                  # Shell com sidebar
│   │   ├── dashboard/page.tsx
│   │   ├── alunos/
│   │   │   ├── page.tsx                # Lista + busca/filtro
│   │   │   └── [studentId]/
│   │   │       ├── page.tsx            # Abas: Dados/Anamnese/Avaliações/Treinos/Feedbacks
│   │   │       └── treino/novo/page.tsx
│   │   ├── exercicios/page.tsx         # Biblioteca CRUD
│   │   ├── anamneses/page.tsx          # Templates
│   │   ├── avaliacoes/page.tsx
│   │   └── configuracoes/
│   │       ├── page.tsx
│   │       └── plano/page.tsx          # Upgrade / gestão de assinatura
│   ├── aluno/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx          # Treino do dia
│   │   ├── treinos/
│   │   │   ├── page.tsx                # Histórico
│   │   │   └── [workoutId]/page.tsx    # Execução + modal PSE
│   │   ├── anamnese/page.tsx
│   │   ├── avaliacoes/page.tsx
│   │   └── chat/page.tsx
│   ├── api/
│   │   ├── stripe/
│   │   │   ├── checkout/route.ts
│   │   │   ├── webhook/route.ts
│   │   │   └── portal/route.ts         # Portal do cliente (cancelar/gerenciar)
│   │   └── invites/route.ts            # Gera token de convite
│   ├── layout.tsx
│   └── globals.css
├── src/
│   ├── components/
│   │   ├── ui/                         # shadcn/ui (button, card, dialog, tabs, ...)
│   │   ├── personal/                   # StudentCard, WorkoutBuilder, ExercisePicker...
│   │   └── aluno/                      # TodayWorkout, PseModal, EvolutionChart...
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts               ✅ entregue
│       │   ├── server.ts               ✅ entregue
│       │   ├── middleware.ts           ✅ entregue
│       │   └── database.types.ts       ✅ entregue
│       ├── stripe/
│       │   └── client.ts
│       ├── validations/                # Zod schemas (anamnese, treino, avaliação...)
│       └── utils.ts                    # cn(), formatters
├── supabase/
│   └── schema.sql                      ✅ entregue (tabelas + RLS + triggers + seed PAR-Q)
├── middleware.ts                       ✅ entregue
├── tailwind.config.ts                  ✅ entregue
├── .env.example                        ✅ entregue
└── package.json                        ✅ entregue
```

## Setup local

```bash
npm install
cp .env.example .env.local   # preencha com suas chaves
npm run dev
```

## Configurar Supabase

1. Crie um projeto em https://supabase.com.
2. Abra **SQL Editor** e rode o conteúdo de `supabase/schema.sql` (cria tabelas, RLS,
   triggers de limite do plano gratuito e o template PAR-Q).
3. Em **Authentication > Providers**, habilite Email e (opcional) Google.
4. Em **Authentication > URL Configuration**, adicione `http://localhost:3000/**` e a
   URL de produção como redirect URLs.
5. Copie `Project URL`, `anon key` e `service_role key` para `.env.local`.

## Configurar Stripe

1. Crie dois produtos no Stripe com preço recorrente mensal:
   - **"TreinaPro Pro"** (ex: R$ 29,90) → copie o `price_id` para `STRIPE_PRO_PRICE_ID`
   - **"TreinaPro Premium"** (ex: R$ 59,90) → copie o `price_id` para `STRIPE_PREMIUM_PRICE_ID`
   Os valores exibidos no app vêm de `src/lib/plans.ts` — se mudar o preço no Stripe,
   atualize esse arquivo também para os dois ficarem coerentes.
2. Em desenvolvimento, use a Stripe CLI para redirecionar webhooks:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
3. Em produção, cadastre o endpoint `https://SEU_DOMINIO/api/stripe/webhook` no
   Dashboard e assine os eventos: `checkout.session.completed`,
   `customer.subscription.updated`, `customer.subscription.deleted`.

## Deploy (Vercel)

1. Suba o projeto para um repositório Git.
2. Importe o repositório em https://vercel.com/new.
3. Configure as variáveis de ambiente do `.env.example` no painel do projeto (Production
   e Preview).
4. Atualize `NEXT_PUBLIC_APP_URL` para o domínio final e reconfigure o Redirect URL no
   Supabase e o endpoint de webhook no Stripe apontando para o domínio de produção.
5. Deploy.

## Status de entrega

Este é um projeto grande — está sendo entregue em partes.

**Parte 1 — base:**
- Estrutura base do Next.js (config, Tailwind, tokens de design)
- Integração Supabase completa: client, server, middleware com proteção de rotas por role
- Schema SQL completo: todas as tabelas, RLS granular, trigger de limite do plano gratuito,
  seed do PAR-Q, buckets de Storage com políticas

**Parte 2 — UI kit, auth e convite:**
- Componentes shadcn/ui: button, card, input, label, badge, dialog, tabs, select, avatar,
  progress, switch, dropdown-menu
- `Providers` (React Query + Toaster) e `app/layout.tsx`
- Landing page completa (hero, features, planos Gratuito/Premium)
- Login (e-mail/senha + Google OAuth) e cadastro do personal
- Fluxo de convite completo: `POST /api/invites` (gera token, valida limite do plano
  gratuito), página `/convite/[token]` (aluno cria conta) e `POST /api/invites/accept`
  (vincula aluno ao personal com client admin, respeitando o trigger de limite do plano)
- Callback de OAuth do Google

**Parte 3 — área do personal:**
- `PersonalSidebar` e `app/personal/layout.tsx` (shell protegido, valida role)
- Dashboard do personal: cards (alunos, plano, anamneses pendentes), banner de upgrade,
  alunos recentes, ações rápidas
- `/personal/alunos`: lista completa com busca e filtro por status
- `InviteStudentDialog` (gera link, copia para área de transferência) e `UpgradeModal`
  (abre automaticamente quando a API retorna `PLAN_LIMIT_REACHED`)

**Parte 4 — montador de treinos, biblioteca de exercícios e anamnese:**
- `WorkoutBuilder` + `WorkoutDayEditor` + `SortableExerciseItem`: montador de treinos com
  dnd-kit (arrastar para reordenar), múltiplos dias, clonagem de rotina
  (`?clone=workoutId`), campos de séries/reps/pausa/observações
- `ExercisePickerDialog` / `ExerciseGrid` / `ExerciseLibrary`: biblioteca de exercícios
  com busca, filtro por categoria, CRUD dos exercícios próprios do personal, thumbnail
  automática do YouTube (`youtubeThumbnail()`), seed inicial em `supabase/seed_exercises.sql`
- `AnamneseTemplateDialog` + `/personal/anamneses`: criação de modelos personalizados com
  perguntas dinâmicas (além do PAR-Q padrão já semeado no schema)

**Parte 5 — lado do aluno completo:**
- `AlunoSidebar` (com navegação inferior no mobile) + `app/aluno/layout.tsx`
- Dashboard do aluno: treino do dia (rotaciona pelos dias da rotina ativa com base no
  último treino concluído), avisos de anamnese/avaliação pendentes
- `WorkoutRunner` + `PseModal`: execução do treino com vídeos, e modal de PSE (0–10) +
  comentário ao concluir
- Histórico de treinos com gráfico de evolução do PSE (Recharts)
- `AnamneseForm`: preenchimento da anamnese pendente
- `AssessmentUploadCard`: upload de fotos/medidas para avaliações solicitadas pelo personal
- `ChatThread`: chat em tempo real (Supabase Realtime) — usado tanto em `/aluno/chat`
  quanto em `/personal/alunos/[studentId]/chat`

**Parte 6 — Stripe:**
- `POST /api/stripe/checkout`: cria sessão de assinatura Premium (cria customer se
  necessário)
- `POST /api/stripe/webhook`: sincroniza `profiles.plan` com `checkout.session.completed`,
  `customer.subscription.updated` e `customer.subscription.deleted`
- `POST /api/stripe/portal`: portal do cliente para gerenciar/cancelar assinatura
- `/personal/configuracoes/plano`: tela de upgrade e gestão da assinatura

## Nota de segurança importante (Next.js 14)

Este projeto usa Next.js 14, que **atingiu fim de vida (EOL) em 26/10/2025**. Fixamos a
versão em `14.2.35` — o último patch da linha 14.x, que corrige, entre outras, uma falha
crítica de bypass de autenticação no middleware (CVE-2025-29927) e vulnerabilidades de
negação de serviço em React Server Components (CVE-2025-55184/67779). Como este app
depende do `middleware.ts` para proteger `/personal/**` e `/aluno/**`, **não use uma
versão anterior a 14.2.35**.

Para produção de longo prazo, o recomendado é migrar para o Next.js 15.x (suporte em
manutenção até 10/2026) ou 16.x (LTS ativo). A migração 14→15 tem mudanças de API
(ex: `cookies()`/`headers()` e `params` passam a ser assíncronos) que não foram
aplicadas nesta entrega — avalie o [guia oficial de upgrade](https://nextjs.org/docs/app/guides/upgrading/version-15)
antes de migrar.

## Correções desta revisão (auditoria + build real)

Rodei `npm install`, `npm run build` e `npm test` de verdade neste ambiente para validar
o projeto e encontrei (e corrigi) 4 bugs reais:

1. **RLS faltando**: não havia policy permitindo o aluno fazer `UPDATE` em `assessments`
   para enviar fotos/medidas depois que o personal solicitava uma avaliação — só existiam
   policies de `SELECT`/`INSERT`. Sem isso, o upload do aluno falhava silenciosamente.
   Corrigido em `schema.sql` e via `supabase/migrations/001_fix_assessments_aluno_update.sql`
   para quem já rodou o schema antigo.
2. **Perfil nunca criado se a confirmação de e-mail estiver ativa**: o cadastro do
   personal criava o `profile` só se já houvesse sessão ativa logo após o `signUp`. Com
   confirmação de e-mail ligada (padrão do Supabase), a sessão não existe nesse momento,
   e o perfil nunca era criado. Agora o app detecta `data.session === null`, avisa o
   usuário para confirmar o e-mail, e o login "autocura" o perfil que faltou, usando os
   metadados salvos no cadastro. Isso também evitava um possível loop de redirecionamento
   entre `/personal` e `/aluno` quando o profile não existia — corrigido nos dois layouts.
3. **`@supabase/supabase-js` com `^2.45.0`** instalava a `2.110.0` (bem mais nova) e
   quebrava a tipagem do `Database` (todo `insert`/`update` virava `never`). Fixei as
   versões exatas (`2.45.4` / `@supabase/ssr@0.4.0`) e corrigi o `database.types.ts` para
   o formato que o `GenericSchema` do supabase-js realmente espera.
4. **`useSearchParams()` sem `<Suspense>`** em `/login` e `/personal/configuracoes/plano`,
   que quebrava o build de produção do Next.js. Corrigido com boundaries de Suspense.

Depois dessas correções, `npm run build` compila 100% limpo (25 rotas, TypeScript e
middleware ok) e os 22 testes em `npm test` passam.

## Rebranding e novidades desta revisão

A pedido do usuário, o app deixou de se chamar "MFIT Clone" (nome de um produto real)
para **TreinaPro**, com uma identidade visual própria:

- **Nome**: TreinaPro, em todo o app (metadata, sidebars, landing, termos/privacidade).
- **Paleta**: preto (`--primary`) como cor de marca + laranja vibrante (`--accent`) para
  CTAs + verde vibrante (`--success`) para indicadores positivos/progresso — um visual
  mais moderno e energético que o navy/branco anterior. Tudo via CSS variables em
  `app/globals.css`, então dá pra reajustar o tom sem tocar em componente nenhum.
- **Hero da landing** ganhou um leve glow gradiente (laranja + verde) sobre o fundo
  preto para reforçar a identidade nova.

### Três planos em vez de dois

- **Grátis** — 1 aluno
- **Pro** — até 3 alunos (R$ 29,90/mês)
- **Premium** — alunos ilimitados (R$ 59,90/mês)

Fonte única de verdade: `src/lib/plans.ts` (nomes, preços, limites, features). O
trigger `enforce_student_plan_limit` no banco foi atualizado para os 3 níveis — se
você já tinha o projeto no ar, rode `supabase/migrations/003_add_pro_plan_tier.sql` e
depois `004_update_plan_limit_trigger.sql`, nessa ordem. No Stripe, agora são
necessários **dois** produtos/preços (`STRIPE_PRO_PRICE_ID` e
`STRIPE_PREMIUM_PRICE_ID` — veja `.env.example`). O checkout, o webhook, o modal de
upgrade e a página de plano foram todos atualizados para os 3 níveis.

### Gráfico de desempenho da carteira (novo)

O dashboard do personal agora tem um gráfico agregado — **treinos concluídos por
semana + PSE médio**, somando todos os alunos, últimas 8 semanas (`OverviewPerformanceChart`,
com Recharts) — pra dar uma visão de negócio além do gráfico de evolução individual
que já existia no perfil de cada aluno.

Depois dessas mudanças, `npm run build` (25 rotas) e os 22 testes automatizados
continuam passando limpo.

## Novas funcionalidades de diferenciação

Todas testáveis sem nenhuma conta ou serviço externo novo (rode antes
`supabase/migrations/005_streak_whatsapp_branding_public_page.sql` se o projeto já
estava no ar). Como testar cada uma:

- **🔥 Streak de treinos** — logue como aluno e conclua um treino em
  `/aluno/dashboard`; o contador de dias seguidos aparece automaticamente no topo.
- **Comparador de fotos (antes/depois)** — no perfil do aluno (personal) ou em
  "Minhas avaliações" (aluno), peça 2 avaliações com foto em datas diferentes; o
  slider de comparação aparece sozinho na aba Avaliações.
- **Substituição de exercício** — no montador de treino, clique no ícone de setas
  circulares ao lado de qualquer exercício; a busca já abre filtrada pelo mesmo
  grupo muscular.
- **Relatório em PDF** — na aba "Feedbacks" do perfil do aluno, botão "Baixar
  relatório PDF" (gerado no navegador com jsPDF, sem backend).
- **Alerta de inatividade** — em `/personal/alunos`, alunos sem treinar há 4+ dias
  ganham um badge vermelho automaticamente (calculado a partir do último
  `workout_log`, sem nenhuma notificação push/e-mail — é um indicador visual).
- **Botão "Chamar no WhatsApp"** — aparece no perfil do aluno (personal) e na
  página pública, usando um link `wa.me` com o telefone cadastrado (o aluno informa
  o telefone ao aceitar o convite; é opcional). Não depende da API oficial do
  WhatsApp Business — é só um link de clique-para-conversar.
- **Marca própria (white-label)** — em `/personal/configuracoes/marca`: envie uma
  logo, escolha uma cor, e a experiência do aluno (`--accent`, sidebar) muda
  automaticamente para refletir a marca do personal, não a do TreinaPro.
- **Página pública** — na mesma tela, ative "página pública" e defina um endereço;
  fica acessível em `/p/seu-endereco`, pública, com botão de WhatsApp para captar
  aluno novo. A view `public_personal_profiles` no banco garante que só colunas
  seguras (nunca e-mail, ids do Stripe etc.) fiquem visíveis publicamente.

`npm run build` (26 rotas) e os 40 testes automatizados passam limpo depois de
todas essas adições.

## Redesign gamificado (inspirado no Duolingo, sem copiar a marca)

Aplicamos a **linguagem visual** de apps gamificados de hábito — não os ativos
registrados do Duolingo (fonte Feather Bold é proprietária deles, "ninguém mais
pode usar"; o mascote Duo e o verde específico são marca registrada). Em vez
disso, usamos nossas próprias cores com significado:

- 🔥 **Fogo (laranja→vermelho)** = urgência do streak — badge com gradiente
- 🟢 **Verde vibrante** = progresso, "você está indo bem"
- 🏆 **Dourado** = conquista, medalha — reservado para celebrações e badges de achievement

Mudanças de token únicas que cascatearam para o app inteiro (Button, Card, Badge,
Dialog etc. usam os mesmos CSS vars):
- `--radius` subiu de 10px para 20px — tudo ficou bem mais arredondado
- Botões `default`/`accent`/nova variante `gold`/nova variante `success` ganharam o
  efeito "botão gordinho": sombra sólida embaixo que encolhe quando você clica
  (`active:translate-y-1`), simulando um botão físico sendo pressionado
- Badges ficaram mais robustos (padding maior, negrito) e ganharam as variantes
  `gold` e `fire` (gradiente)

Novidades específicas no dashboard do aluno (`app/aluno/dashboard/page.tsx`):
- **Anel de progresso semanal** (`ProgressRing`, SVG) — mostra quantos treinos da
  rotina ativa já foram feitos nos últimos 7 dias, estilo "fechar o anel" do
  Apple Fitness (comprovadamente mais satisfatório que uma barra reta)
- **Card dourado de celebração** quando a meta da semana é batida
- **Conquistas** (`src/lib/achievements.ts`) — badges desbloqueados por marcos de
  streak (3, 7, 14, 30, 100 dias) e de total de treinos (10, 25, 50, 100),
  calculados a partir dos dados que já existem, sem precisar de tabela nova no
  banco. Mostra também qual é a próxima conquista e quanto falta pra ela.

`npm run build` (26 rotas) e os 48 testes automatizados (8 novos, para as
conquistas) passam limpo depois dessas mudanças.

## O que falta para produção

- Substituir o seed de ~30 exercícios por uma base maior (CSV) se quiser chegar aos
  1.800+ itens mencionados no briefing original
- Testar o fluxo Stripe ponta a ponta com a Stripe CLI antes de ir para produção
- Ajustar textos/copy da landing page e políticas (termos de uso, privacidade)
- Adicionar testes automatizados (não incluídos nesta entrega)
