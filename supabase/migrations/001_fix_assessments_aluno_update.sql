-- Migração: adiciona a policy de UPDATE que faltava para o aluno em `assessments`.
-- Rode este script se você já executou supabase/schema.sql antes desta correção.
-- (Se estiver criando o projeto do zero, basta rodar schema.sql normalmente —
-- esta policy já está incluída nele.)

create policy "assessments_aluno_update"
  on assessments for update
  using (is_owner_of_student(student_id))
  with check (is_owner_of_student(student_id));
