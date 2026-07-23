-- =========================================================
-- 010 — Corrige recursão infinita nas policies de desafios
-- As policies de `challenges` e `challenge_participants` se referenciavam
-- mutuamente (SELECT de uma disparava a RLS da outra e vice-versa), gerando
-- "infinite recursion detected in policy". Mesmo padrão da migration 002:
-- mover os lookups para funções SECURITY DEFINER (que não re-disparam RLS).
-- Rode no SQL Editor do Supabase.
-- =========================================================

create or replace function is_personal_of_challenge(p_challenge_id uuid)
returns boolean as $$
  select exists (
    select 1 from challenges c
    where c.id = p_challenge_id and c.personal_id = auth.uid()
  );
$$ language sql security definer stable;

create or replace function is_participant_of_challenge(p_challenge_id uuid)
returns boolean as $$
  select exists (
    select 1 from challenge_participants cp
    join students s on s.id = cp.student_id
    where cp.challenge_id = p_challenge_id and s.profile_id = auth.uid()
  );
$$ language sql security definer stable;

-- Recria a policy de SELECT do aluno em challenges usando o helper.
drop policy if exists "challenges_aluno_select" on challenges;
create policy "challenges_aluno_select"
  on challenges for select
  using (is_participant_of_challenge(id));

-- Recria a policy do personal em challenge_participants usando o helper.
drop policy if exists "participants_personal_full_access" on challenge_participants;
create policy "participants_personal_full_access"
  on challenge_participants for all
  using (is_personal_of_challenge(challenge_id))
  with check (is_personal_of_challenge(challenge_id));
