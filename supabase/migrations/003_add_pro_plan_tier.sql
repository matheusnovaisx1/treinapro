-- Adiciona o novo plano intermediário "Pro" (3 alunos) ao projeto já em produção.
-- Rode este script no SQL Editor do seu projeto Supabase.
-- Importante: rode o ALTER TYPE sozinho, em uma execução separada do restante,
-- caso o SQL Editor reclame de "unsafe use of new value" (limitação do Postgres
-- para usar um valor de enum recém-criado na mesma transação).

alter type plan_type add value if not exists 'pro';
