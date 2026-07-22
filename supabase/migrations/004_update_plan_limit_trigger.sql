-- Rode DEPOIS de 003_add_pro_plan_tier.sql ter sido aplicado com sucesso.
-- Atualiza a função de limite de alunos para o novo esquema de 3 planos:
-- free: 1 aluno · pro: 3 alunos · premium: ilimitado.

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
