-- =========================================================
-- 012 — MODELOS DE TREINO (workout_templates)
-- O personal monta um modelo uma vez e atribui a vários alunos de uma vez
-- (cada atribuição cria um workout copiando os dias do modelo).
-- Rode no SQL Editor do Supabase.
-- =========================================================

create table workout_templates (
  id uuid primary key default uuid_generate_v4(),
  personal_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  -- Mesma estrutura de workouts.days:
  -- [{ key, label, exercises: [{ exercise_id, name, sets, reps, rest_seconds, notes, order }] }]
  days jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create index idx_workout_templates_personal_id on workout_templates(personal_id);

alter table workout_templates enable row level security;

create policy "workout_templates_personal_full_access"
  on workout_templates for all
  using (personal_id = auth.uid())
  with check (personal_id = auth.uid());
