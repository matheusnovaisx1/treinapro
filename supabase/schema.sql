-- =========================================================
-- MFIT CLONE — SCHEMA + RLS
-- Rode este script no SQL Editor do Supabase (projeto novo)
-- =========================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------
create type user_role as enum ('personal', 'aluno');
create type plan_type as enum ('free', 'pro', 'premium');
create type invite_status as enum ('pending', 'accepted', 'expired');
create type anamnese_status as enum ('pending', 'completed');

-- ---------------------------------------------------------
-- PROFILES (1:1 com auth.users)
-- ---------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'aluno',
  full_name text,
  email text not null,
  avatar_url text,
  -- Preenchido apenas quando role = 'aluno': personal responsável
  personal_id uuid references profiles(id) on delete set null,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan plan_type not null default 'free',
  plan_price numeric(10,2) not null default 49.90, -- mantido por compatibilidade; preços reais vêm de src/lib/plans.ts
  phone text, -- usado no botão "chamar no WhatsApp"
  bio text, -- usado na página pública do personal
  brand_color text, -- marca própria: cor de destaque exibida para os alunos deste personal
  brand_logo_url text, -- marca própria: logo exibida no lugar do wordmark TreinaPro
  public_slug text unique, -- usado na URL pública /p/[slug]
  is_public_page_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_personal_id on profiles(personal_id);

-- ---------------------------------------------------------
-- INVITES — token único gerado pelo personal para cadastro do aluno
-- ---------------------------------------------------------
create table invites (
  id uuid primary key default uuid_generate_v4(),
  personal_id uuid not null references profiles(id) on delete cascade,
  token text not null unique,
  email text,
  status invite_status not null default 'pending',
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

create index idx_invites_token on invites(token);

-- ---------------------------------------------------------
-- STUDENTS — vínculo formal personal <-> aluno
-- ---------------------------------------------------------
create table students (
  id uuid primary key default uuid_generate_v4(),
  personal_id uuid not null references profiles(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'active', -- active | inactive | invited
  notes text, -- anotações fixas: lesões, medicamentos, etc.
  created_at timestamptz not null default now(),
  unique (personal_id, profile_id)
);

create index idx_students_personal_id on students(personal_id);
create index idx_students_profile_id on students(profile_id);

-- ---------------------------------------------------------
-- ANAMNESE TEMPLATES (PAR-Q, padrão, personalizados)
-- ---------------------------------------------------------
create table anamnese_templates (
  id uuid primary key default uuid_generate_v4(),
  personal_id uuid references profiles(id) on delete cascade, -- null = template global do sistema
  name text not null,
  questions jsonb not null default '[]',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table anamneses (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references students(id) on delete cascade,
  template_id uuid references anamnese_templates(id) on delete set null,
  questions jsonb not null default '[]',
  answers jsonb not null default '{}',
  status anamnese_status not null default 'pending',
  sent_at timestamptz not null default now(),
  completed_at timestamptz
);

create index idx_anamneses_student_id on anamneses(student_id);

-- ---------------------------------------------------------
-- ASSESSMENTS (avaliações: morfológica, postural, neuromotora)
-- ---------------------------------------------------------
create table assessments (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references students(id) on delete cascade,
  type text not null, -- 'morfologica' | 'postural' | 'neuromotora' | 'fotos'
  data jsonb not null default '{}', -- medidas, dobras, %gordura, etc.
  images text[] not null default '{}', -- paths no Storage
  requested boolean not null default false, -- true = personal pediu upload ao aluno
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create index idx_assessments_student_id on assessments(student_id);

-- ---------------------------------------------------------
-- EXERCISES (biblioteca)
-- ---------------------------------------------------------
create table exercises (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  video_url text,
  category text, -- 'peito', 'costas', 'perna', 'ombro', 'core', etc.
  muscle_group text,
  equipment text,
  instructions text,
  is_public boolean not null default true, -- base pública (1800+) vs. exercício próprio do personal
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_exercises_category on exercises(category);
create index idx_exercises_created_by on exercises(created_by);

-- ---------------------------------------------------------
-- WORKOUTS (rotinas de treino)
-- ---------------------------------------------------------
create table workouts (
  id uuid primary key default uuid_generate_v4(),
  personal_id uuid not null references profiles(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  name text not null,
  start_date date,
  end_date date,
  -- days: [{ key: 'A', label: 'Treino A - Peito/Tríceps', exercises: [{ exercise_id, sets, reps, rest_seconds, notes, order }] }]
  days jsonb not null default '[]',
  is_extra boolean not null default false, -- treino avulso fora da rotina vigente
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_workouts_student_id on workouts(student_id);
create index idx_workouts_personal_id on workouts(personal_id);

-- ---------------------------------------------------------
-- WORKOUT LOGS (feedback pós-treino)
-- ---------------------------------------------------------
create table workout_logs (
  id uuid primary key default uuid_generate_v4(),
  workout_id uuid not null references workouts(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  day_key text, -- referencia o dia dentro de workouts.days
  completed_at timestamptz not null default now(),
  pse smallint check (pse between 0 and 10),
  comment text,
  loads jsonb default '{}' -- cargas realizadas por exercício, para gráficos de evolução
);

create index idx_workout_logs_student_id on workout_logs(student_id);
create index idx_workout_logs_workout_id on workout_logs(workout_id);

-- ---------------------------------------------------------
-- MESSAGES (chat simples personal <-> aluno)
-- ---------------------------------------------------------
create table messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid not null references profiles(id) on delete cascade,
  receiver_id uuid not null references profiles(id) on delete cascade,
  text text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_messages_conversation on messages(sender_id, receiver_id, created_at);

-- =========================================================
-- FUNÇÃO: limite de alunos por plano
-- free: 1 aluno · pro: 3 alunos · premium: ilimitado
-- Mantenha os números abaixo sincronizados com PLAN_TIERS em src/lib/plans.ts
-- =========================================================
create or replace function enforce_student_plan_limit()
returns trigger as $$
declare
  v_plan plan_type;
  v_count integer;
  v_limit integer;
begin
  select plan into v_plan from profiles where id = new.personal_id;

  v_limit := case v_plan
    when 'free' then 1
    when 'pro' then 3
    else null -- premium: sem limite
  end;

  if v_limit is not null then
    select count(*) into v_count from students where personal_id = new.personal_id;
    if v_count >= v_limit then
      raise exception 'PLAN_LIMIT_REACHED: faça upgrade de plano para adicionar mais alunos';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_enforce_student_plan_limit
  before insert on students
  for each row execute function enforce_student_plan_limit();

-- =========================================================
-- updated_at automático em profiles
-- =========================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table profiles enable row level security;
alter table invites enable row level security;
alter table students enable row level security;
alter table anamnese_templates enable row level security;
alter table anamneses enable row level security;
alter table assessments enable row level security;
alter table exercises enable row level security;
alter table workouts enable row level security;
alter table workout_logs enable row level security;
alter table messages enable row level security;

-- Helper: verifica se o usuário autenticado é o personal responsável pelo aluno (student_id)
create or replace function is_personal_of_student(p_student_id uuid)
returns boolean as $$
  select exists (
    select 1 from students s
    where s.id = p_student_id and s.personal_id = auth.uid()
  );
$$ language sql security definer stable;

-- Helper: verifica se o usuário autenticado É o aluno (profile_id do vínculo student_id)
create or replace function is_owner_of_student(p_student_id uuid)
returns boolean as $$
  select exists (
    select 1 from students s
    where s.id = p_student_id and s.profile_id = auth.uid()
  );
$$ language sql security definer stable;

-- Helper: retorna o personal_id do usuário autenticado (SECURITY DEFINER contorna a
-- RLS na consulta interna). Sem isso, a policy abaixo faria uma subquery em `profiles`
-- dentro da própria policy de `profiles`, o que o Postgres trata como recursão e trava
-- a consulta (erro "infinite recursion detected in policy for relation profiles").
create or replace function my_personal_id()
returns uuid as $$
  select personal_id from profiles where id = auth.uid();
$$ language sql security definer stable;

-- ---------- PROFILES ----------
create policy "profiles_select_own_or_related"
  on profiles for select
  using (
    id = auth.uid()
    or personal_id = auth.uid()
    or id = my_personal_id()
  );

create policy "profiles_update_own"
  on profiles for update
  using (id = auth.uid());

create policy "profiles_insert_own"
  on profiles for insert
  with check (id = auth.uid());

-- View pública e segura para a página /p/[slug]: expõe só as colunas necessárias
-- (nunca stripe_customer_id, e-mail, etc.), e só quando o personal ativou a opção.
-- Views não herdam RLS da tabela por padrão, então isso funciona mesmo para
-- visitantes anônimos, sem precisar abrir uma policy de SELECT pública em `profiles`.
create view public_personal_profiles as
  select id, full_name, avatar_url, bio, phone, brand_color, brand_logo_url, public_slug
  from profiles
  where is_public_page_enabled = true and public_slug is not null;

grant select on public_personal_profiles to anon, authenticated;

-- ---------- INVITES ----------
create policy "invites_all_personal_owns"
  on invites for all
  using (personal_id = auth.uid())
  with check (personal_id = auth.uid());

-- Sem policy pública de SELECT aqui de propósito: com `using (true)`, qualquer
-- pessoa (sem login) conseguiria listar TODOS os convites de TODOS os personais
-- via API REST direta do Supabase (tokens, e-mails, tudo), não só o convite do
-- link que ela tem. A checagem por token acontece em GET /api/invites/[token],
-- que usa o client admin no servidor e devolve só os campos necessários.

-- ---------- STUDENTS ----------
create policy "students_all_personal_owns"
  on students for all
  using (personal_id = auth.uid())
  with check (personal_id = auth.uid());

create policy "students_select_own_record"
  on students for select
  using (profile_id = auth.uid());

-- ---------- ANAMNESE TEMPLATES ----------
create policy "templates_select_own_or_global"
  on anamnese_templates for select
  using (personal_id = auth.uid() or personal_id is null);

create policy "templates_modify_own"
  on anamnese_templates for insert
  with check (personal_id = auth.uid());

create policy "templates_update_own"
  on anamnese_templates for update
  using (personal_id = auth.uid());

create policy "templates_delete_own"
  on anamnese_templates for delete
  using (personal_id = auth.uid());

-- ---------- ANAMNESES ----------
create policy "anamneses_personal_full_access"
  on anamneses for all
  using (is_personal_of_student(student_id))
  with check (is_personal_of_student(student_id));

create policy "anamneses_aluno_select"
  on anamneses for select
  using (is_owner_of_student(student_id));

create policy "anamneses_aluno_update_answers"
  on anamneses for update
  using (is_owner_of_student(student_id))
  with check (is_owner_of_student(student_id));

-- ---------- ASSESSMENTS ----------
create policy "assessments_personal_full_access"
  on assessments for all
  using (is_personal_of_student(student_id))
  with check (is_personal_of_student(student_id));

create policy "assessments_aluno_select"
  on assessments for select
  using (is_owner_of_student(student_id));

create policy "assessments_aluno_insert"
  on assessments for insert
  with check (is_owner_of_student(student_id));

-- Sem esta policy, o aluno não conseguia preencher a avaliação solicitada pelo personal
-- (o personal cria a linha com requested=true; o aluno precisa de UPDATE para anexar
-- fotos/medidas depois).
create policy "assessments_aluno_update"
  on assessments for update
  using (is_owner_of_student(student_id))
  with check (is_owner_of_student(student_id));

-- ---------- EXERCISES ----------
create policy "exercises_select_public_or_own"
  on exercises for select
  using (is_public = true or created_by = auth.uid());

create policy "exercises_insert_own"
  on exercises for insert
  with check (created_by = auth.uid());

create policy "exercises_update_own"
  on exercises for update
  using (created_by = auth.uid());

create policy "exercises_delete_own"
  on exercises for delete
  using (created_by = auth.uid());

-- ---------- WORKOUTS ----------
create policy "workouts_personal_full_access"
  on workouts for all
  using (personal_id = auth.uid())
  with check (personal_id = auth.uid());

create policy "workouts_aluno_select"
  on workouts for select
  using (is_owner_of_student(student_id));

-- ---------- WORKOUT LOGS ----------
create policy "workout_logs_personal_select"
  on workout_logs for select
  using (is_personal_of_student(student_id));

create policy "workout_logs_aluno_full_access"
  on workout_logs for all
  using (is_owner_of_student(student_id))
  with check (is_owner_of_student(student_id));

-- ---------- MESSAGES ----------
create policy "messages_participants_select"
  on messages for select
  using (sender_id = auth.uid() or receiver_id = auth.uid());

create policy "messages_sender_insert"
  on messages for insert
  with check (sender_id = auth.uid());

create policy "messages_receiver_update_read"
  on messages for update
  using (receiver_id = auth.uid());

-- =========================================================
-- TEMPLATE PADRÃO PAR-Q (seed)
-- =========================================================
insert into anamnese_templates (personal_id, name, questions, is_default) values (
  null,
  'PAR-Q (Padrão)',
  '[
    {"id": "q1", "text": "Algum médico já disse que você possui um problema cardíaco e recomendou atividade física apenas sob supervisão?"},
    {"id": "q2", "text": "Você sente dor no peito quando pratica atividade física?"},
    {"id": "q3", "text": "No último mês, você sentiu dor no peito quando não estava praticando atividade física?"},
    {"id": "q4", "text": "Você mantém o equilíbrio devido a tonturas ou perda de consciência?"},
    {"id": "q5", "text": "Você tem algum problema ósseo ou articular que poderia ser piorado pela atividade física?"},
    {"id": "q6", "text": "Você toma atualmente algum medicamento para pressão arterial ou problema cardíaco?"},
    {"id": "q7", "text": "Você conhece alguma outra razão pela qual não deveria praticar atividade física?"}
  ]'::jsonb,
  true
);

-- =========================================================
-- STORAGE BUCKETS (execute também via Dashboard > Storage se preferir)
-- =========================================================
-- file_size_limit em bytes; allowed_mime_types restringe upload no nível do
-- Storage (o Supabase rejeita antes mesmo de gravar) — proteção que não
-- depende de validação no frontend.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('assessment-photos', 'assessment-photos', false, 10485760, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('brand-logos', 'brand-logos', true, 2097152, array['image/png', 'image/jpeg', 'image/webp', 'image/x-icon'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Políticas de storage: aluno só sobe/lê fotos vinculadas a si mesmo;
-- personal lê fotos dos seus alunos.
create policy "assessment_photos_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'assessment-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "assessment_photos_select_own_or_personal"
  on storage.objects for select
  using (
    bucket_id = 'assessment-photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from students s
        where s.profile_id::text = (storage.foldername(name))[1]
        and s.personal_id = auth.uid()
      )
    )
  );

create policy "avatars_public_select"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_insert_own"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "brand_logos_public_select"
  on storage.objects for select
  using (bucket_id = 'brand-logos');

create policy "brand_logos_insert_own"
  on storage.objects for insert
  with check (bucket_id = 'brand-logos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "brand_logos_update_own"
  on storage.objects for update
  using (bucket_id = 'brand-logos' and (storage.foldername(name))[1] = auth.uid()::text);
