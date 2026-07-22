-- CORREÇÃO URGENTE: a policy de SELECT em `profiles` tinha uma subquery na própria
-- tabela `profiles`, o que o Postgres trata como recursão e trava a consulta
-- (erro "infinite recursion detected in policy for relation profiles"). Isso fazia o
-- login travar sem nenhum erro visível (a exceção morre no navegador antes de chegar
-- a um toast).
--
-- Rode este script agora no SQL Editor do seu projeto Supabase.

create or replace function my_personal_id()
returns uuid as $$
  select personal_id from profiles where id = auth.uid();
$$ language sql security definer stable;

drop policy if exists "profiles_select_own_or_related" on profiles;

create policy "profiles_select_own_or_related"
  on profiles for select
  using (
    id = auth.uid()
    or personal_id = auth.uid()
    or id = my_personal_id()
  );
