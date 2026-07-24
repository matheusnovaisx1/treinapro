-- =========================================================
-- 013 — PUSH SUBSCRIPTIONS (web push)
-- Guarda a inscrição de push de cada dispositivo/usuário. Cada usuário gerencia
-- apenas as próprias inscrições. Rode no SQL Editor do Supabase.
-- =========================================================

create table push_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index idx_push_subscriptions_user_id on push_subscriptions(user_id);

alter table push_subscriptions enable row level security;

create policy "push_subscriptions_own"
  on push_subscriptions for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
