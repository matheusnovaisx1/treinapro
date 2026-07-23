-- =========================================================
-- 009 — DESAFIOS (challenges) entre os alunos de um personal
-- Ranking por número de treinos concluídos no período.
-- Rode no SQL Editor do Supabase.
-- =========================================================

-- ---------------------------------------------------------
-- CHALLENGES (desafio criado pelo personal)
-- ---------------------------------------------------------
create table challenges (
  id uuid primary key default uuid_generate_v4(),
  personal_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  description text,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now()
);

create index idx_challenges_personal_id on challenges(personal_id);

-- ---------------------------------------------------------
-- CHALLENGE PARTICIPANTS (alunos inscritos)
-- ---------------------------------------------------------
create table challenge_participants (
  id uuid primary key default uuid_generate_v4(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (challenge_id, student_id)
);

create index idx_challenge_participants_challenge_id on challenge_participants(challenge_id);
create index idx_challenge_participants_student_id on challenge_participants(student_id);

-- =========================================================
-- RLS
-- =========================================================
alter table challenges enable row level security;
alter table challenge_participants enable row level security;

-- ---------- CHALLENGES ----------
create policy "challenges_personal_full_access"
  on challenges for all
  using (personal_id = auth.uid())
  with check (personal_id = auth.uid());

-- Aluno vê os desafios em que participa.
create policy "challenges_aluno_select"
  on challenges for select
  using (
    exists (
      select 1 from challenge_participants cp
      join students s on s.id = cp.student_id
      where cp.challenge_id = challenges.id and s.profile_id = auth.uid()
    )
  );

-- ---------- CHALLENGE PARTICIPANTS ----------
create policy "participants_personal_full_access"
  on challenge_participants for all
  using (
    exists (select 1 from challenges c where c.id = challenge_id and c.personal_id = auth.uid())
  )
  with check (
    exists (select 1 from challenges c where c.id = challenge_id and c.personal_id = auth.uid())
  );

-- Aluno vê a própria inscrição.
create policy "participants_aluno_select_own"
  on challenge_participants for select
  using (
    exists (select 1 from students s where s.id = student_id and s.profile_id = auth.uid())
  );

-- =========================================================
-- RPC: cria desafio e auto-inscreve todos os alunos ativos do personal.
-- SECURITY INVOKER (padrão): a RLS se aplica.
-- =========================================================
create or replace function create_challenge(
  p_name text,
  p_description text,
  p_start date,
  p_end date
) returns uuid as $$
declare
  v_id uuid;
begin
  insert into challenges (personal_id, name, description, start_date, end_date)
  values (auth.uid(), p_name, p_description, p_start, p_end)
  returning id into v_id;

  insert into challenge_participants (challenge_id, student_id)
  select v_id, s.id
  from students s
  where s.personal_id = auth.uid() and s.status = 'active';

  return v_id;
end;
$$ language plpgsql;

-- =========================================================
-- FUNÇÃO: leaderboard do desafio (ranking por treinos no período).
-- SECURITY DEFINER para agregar treinos de todos os participantes sem abrir
-- a RLS de workout_logs; a autorização (personal dono OU participante) é
-- checada dentro da própria consulta.
-- =========================================================
create or replace function challenge_leaderboard(p_challenge_id uuid)
returns table (
  student_id uuid,
  full_name text,
  avatar_url text,
  score bigint,
  position bigint
) as $$
  select
    cp.student_id,
    p.full_name,
    p.avatar_url,
    count(wl.id) as score,
    rank() over (order by count(wl.id) desc) as position
  from challenge_participants cp
  join challenges c on c.id = cp.challenge_id
  join students s on s.id = cp.student_id
  join profiles p on p.id = s.profile_id
  left join workout_logs wl
    on wl.student_id = cp.student_id
    and wl.completed_at::date between c.start_date and c.end_date
  where cp.challenge_id = p_challenge_id
    and (
      c.personal_id = auth.uid()
      or exists (
        select 1 from challenge_participants cp2
        join students s2 on s2.id = cp2.student_id
        where cp2.challenge_id = p_challenge_id and s2.profile_id = auth.uid()
      )
    )
  group by cp.student_id, p.full_name, p.avatar_url
  order by score desc, p.full_name;
$$ language sql security definer stable;
