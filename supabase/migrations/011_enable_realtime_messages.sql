-- =========================================================
-- 011 — Habilita realtime na tabela messages
-- Sem isso, a subscription do chat (postgres_changes) não recebe eventos e as
-- mensagens só apareciam ao recarregar a página. O realtime respeita a RLS, então
-- cada usuário só recebe as mensagens das conversas das quais participa.
-- Rode no SQL Editor do Supabase.
-- =========================================================

alter publication supabase_realtime add table messages;

-- REPLICA IDENTITY FULL garante que o payload do evento traga a linha completa
-- (necessário para o filtro por sender_id/receiver_id no cliente).
alter table messages replica identity full;
