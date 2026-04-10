-- Migration V3 - Fotos no Chamado
ALTER TABLE chamados ADD COLUMN IF NOT EXISTS fotos JSONB DEFAULT '[]'::jsonb;
