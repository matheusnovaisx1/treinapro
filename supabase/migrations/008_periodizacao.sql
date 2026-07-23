-- =========================================================
-- 008 — PERIODIZAÇÃO DE TREINO
-- Macrociclo (training_plans) -> Mesociclo (mesocycles) ->
-- Microciclo (microcycles) -> Ficha diária (workouts.microcycle_id)
-- Rode no SQL Editor do Supabase.
-- =========================================================

-- ---------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------
create type training_goal as enum ('emagrecimento', 'hipertrofia', 'forca', 'condicionamento');
create type experience_level as enum ('iniciante', 'intermediario', 'avancado');
create type cycle_status as enum ('draft', 'active', 'completed', 'paused');
-- Fases (mesociclo). Rótulos amigáveis ficam em src/lib/periodization.ts.
create type mesocycle_focus as enum ('adaptacao', 'hipertrofia', 'forca', 'deload');
create type microcycle_status as enum ('upcoming', 'current', 'done', 'skipped');

-- ---------------------------------------------------------
-- TRAINING PLANS (macrociclo — o plano do aluno)
-- ---------------------------------------------------------
create table training_plans (
  id uuid primary key default uuid_generate_v4(),
  personal_id uuid not null references profiles(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  name text not null default 'Plano de treino',
  goal training_goal not null,
  experience experience_level not null,
  weekly_frequency smallint not null default 3 check (weekly_frequency between 1 and 7),
  session_minutes smallint, -- tempo alvo por sessão (opcional)
  restrictions text, -- lesões / dores / restrições declaradas no onboarding
  start_date date not null,
  end_date date,
  status cycle_status not null default 'draft',
  created_at timestamptz not null default now()
);

create index idx_training_plans_student_id on training_plans(student_id);
create index idx_training_plans_personal_id on training_plans(personal_id);
-- Garante no máximo um plano ativo por aluno (parcial: só vale para status='active').
create unique index uniq_active_plan_per_student on training_plans(student_id) where status = 'active';

-- ---------------------------------------------------------
-- MESOCYCLES (bloco de 4-6 semanas com foco específico)
-- ---------------------------------------------------------
create table mesocycles (
  id uuid primary key default uuid_generate_v4(),
  plan_id uuid not null references training_plans(id) on delete cascade,
  ord smallint not null, -- ordem dentro do macrociclo (1, 2, 3...)
  focus mesocycle_focus not null,
  planned_weeks smallint not null default 4 check (planned_weeks between 1 and 8),
  start_date date not null,
  end_date date not null,
  status cycle_status not null default 'draft',
  -- Referências para montar as cargas dos microciclos (multiplicadores relativos).
  target_volume numeric(4,2) not null default 1.0,    -- volume relativo (ex: 1.0 base, 0.6 deload)
  target_intensity numeric(4,2) not null default 1.0, -- intensidade relativa
  created_at timestamptz not null default now(),
  unique (plan_id, ord)
);

create index idx_mesocycles_plan_id on mesocycles(plan_id);

-- ---------------------------------------------------------
-- MICROCYCLES (a semana)
-- ---------------------------------------------------------
create table microcycles (
  id uuid primary key default uuid_generate_v4(),
  mesocycle_id uuid not null references mesocycles(id) on delete cascade,
  week_number smallint not null, -- semana dentro do mesociclo (1..planned_weeks)
  start_date date not null,
  end_date date not null,
  status microcycle_status not null default 'upcoming',
  -- Multiplicadores aplicados sobre a última carga registrada para progressão.
  volume_multiplier numeric(4,2) not null default 1.0,
  intensity_multiplier numeric(4,2) not null default 1.0,
  created_at timestamptz not null default now(),
  unique (mesocycle_id, week_number)
);

create index idx_microcycles_mesocycle_id on microcycles(mesocycle_id);

-- ---------------------------------------------------------
-- Liga a ficha diária existente ao microciclo (semana).
-- Nullable de propósito: alunos/treinos sem plano continuam funcionando.
-- ---------------------------------------------------------
alter table workouts add column microcycle_id uuid references microcycles(id) on delete set null;
create index idx_workouts_microcycle_id on workouts(microcycle_id);

-- =========================================================
-- ROW LEVEL SECURITY (mesmo padrão das demais tabelas)
-- =========================================================
alter table training_plans enable row level security;
alter table mesocycles enable row level security;
alter table microcycles enable row level security;

-- ---------- TRAINING PLANS ----------
create policy "training_plans_personal_full_access"
  on training_plans for all
  using (is_personal_of_student(student_id))
  with check (is_personal_of_student(student_id));

create policy "training_plans_aluno_select"
  on training_plans for select
  using (is_owner_of_student(student_id));

-- ---------- MESOCYCLES ----------
-- Helper: o usuário é o personal dono do plano ao qual o mesociclo pertence?
create or replace function is_personal_of_plan(p_plan_id uuid)
returns boolean as $$
  select exists (
    select 1 from training_plans tp
    where tp.id = p_plan_id and is_personal_of_student(tp.student_id)
  );
$$ language sql security definer stable;

create or replace function is_aluno_of_plan(p_plan_id uuid)
returns boolean as $$
  select exists (
    select 1 from training_plans tp
    where tp.id = p_plan_id and is_owner_of_student(tp.student_id)
  );
$$ language sql security definer stable;

create policy "mesocycles_personal_full_access"
  on mesocycles for all
  using (is_personal_of_plan(plan_id))
  with check (is_personal_of_plan(plan_id));

create policy "mesocycles_aluno_select"
  on mesocycles for select
  using (is_aluno_of_plan(plan_id));

-- ---------- MICROCYCLES ----------
create or replace function is_personal_of_mesocycle(p_mesocycle_id uuid)
returns boolean as $$
  select exists (
    select 1 from mesocycles m
    where m.id = p_mesocycle_id and is_personal_of_plan(m.plan_id)
  );
$$ language sql security definer stable;

create or replace function is_aluno_of_mesocycle(p_mesocycle_id uuid)
returns boolean as $$
  select exists (
    select 1 from mesocycles m
    where m.id = p_mesocycle_id and is_aluno_of_plan(m.plan_id)
  );
$$ language sql security definer stable;

create policy "microcycles_personal_full_access"
  on microcycles for all
  using (is_personal_of_mesocycle(mesocycle_id))
  with check (is_personal_of_mesocycle(mesocycle_id));

create policy "microcycles_aluno_select"
  on microcycles for select
  using (is_aluno_of_mesocycle(mesocycle_id));

-- =========================================================
-- RPC: cria um macrociclo completo (plano + mesos + micros) numa transação
-- e o deixa ativo, concluindo qualquer plano ativo anterior do mesmo aluno.
-- SECURITY INVOKER (padrão): a RLS se aplica normalmente.
-- =========================================================
create or replace function create_training_plan(
  p_student_id uuid,
  p_name text,
  p_goal training_goal,
  p_experience experience_level,
  p_weekly_frequency smallint,
  p_session_minutes smallint,
  p_restrictions text,
  p_start_date date,
  p_end_date date,
  p_mesocycles jsonb
) returns uuid as $$
declare
  v_plan_id uuid;
  v_meso jsonb;
  v_meso_id uuid;
  v_micro jsonb;
begin
  if not is_personal_of_student(p_student_id) then
    raise exception 'NOT_AUTHORIZED: você não é o personal deste aluno';
  end if;

  -- Só pode haver um plano ativo por aluno.
  update training_plans set status = 'completed'
    where student_id = p_student_id and status = 'active';

  insert into training_plans (
    personal_id, student_id, name, goal, experience,
    weekly_frequency, session_minutes, restrictions, start_date, end_date, status
  ) values (
    auth.uid(), p_student_id, p_name, p_goal, p_experience,
    p_weekly_frequency, p_session_minutes, p_restrictions, p_start_date, p_end_date, 'active'
  ) returning id into v_plan_id;

  for v_meso in select * from jsonb_array_elements(p_mesocycles)
  loop
    insert into mesocycles (
      plan_id, ord, focus, planned_weeks, start_date, end_date, target_volume, target_intensity
    ) values (
      v_plan_id,
      (v_meso->>'ord')::smallint,
      (v_meso->>'focus')::mesocycle_focus,
      (v_meso->>'planned_weeks')::smallint,
      (v_meso->>'start_date')::date,
      (v_meso->>'end_date')::date,
      (v_meso->>'target_volume')::numeric,
      (v_meso->>'target_intensity')::numeric
    ) returning id into v_meso_id;

    for v_micro in select * from jsonb_array_elements(v_meso->'microcycles')
    loop
      insert into microcycles (
        mesocycle_id, week_number, start_date, end_date, volume_multiplier, intensity_multiplier
      ) values (
        v_meso_id,
        (v_micro->>'week_number')::smallint,
        (v_micro->>'start_date')::date,
        (v_micro->>'end_date')::date,
        (v_micro->>'volume_multiplier')::numeric,
        (v_micro->>'intensity_multiplier')::numeric
      );
    end loop;
  end loop;

  return v_plan_id;
end;
$$ language plpgsql;
