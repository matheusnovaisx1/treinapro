-- CORREÇÃO DE SEGURANÇA IMPORTANTE — rode isso antes de deixar o app público.
--
-- A policy "invites_select_by_token_public" usava `using (true)`, o que
-- permitia que QUALQUER PESSOA (sem login) listasse TODOS os convites de
-- TODOS os personais via API REST direta do Supabase — não só o convite do
-- link que ela tinha em mãos. Isso expunha tokens, e-mails e quantos alunos
-- cada personal está convidando.
--
-- A verificação de convite por token agora passa por uma rota de servidor
-- (GET /api/invites/[token]), que usa o client admin e devolve só os campos
-- necessários — então essa policy pode ser removida com segurança.

drop policy if exists "invites_select_by_token_public" on invites;
