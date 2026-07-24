-- =========================================================
-- 014 — Duração do treino
-- Guarda quanto tempo o aluno levou no treino (cronômetro do runner).
-- Rode no SQL Editor do Supabase.
-- =========================================================

alter table workout_logs add column duration_seconds integer;
