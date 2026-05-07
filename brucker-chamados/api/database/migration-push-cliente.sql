-- Adiciona coluna push_token na tabela clientes para suportar push notifications.
-- Rodar UMA VEZ no Supabase SQL Editor (banco de produção).

ALTER TABLE clientes ADD COLUMN IF NOT EXISTS push_token TEXT;
