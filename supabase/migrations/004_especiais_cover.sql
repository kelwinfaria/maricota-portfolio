-- Capa customizável por coleção especial.
-- Rodar no Supabase SQL Editor (DDL não funciona via API/PostgREST).

alter table public.especiais_slots
  add column if not exists cover text;
