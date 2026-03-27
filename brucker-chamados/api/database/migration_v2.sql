-- ============================================
-- Brucker Printers - Sistema de Chamados
-- Migration V2 - Requisitos Luciano
-- ============================================

-- ============================================
-- 1. NOVO STATUS "atribuido" NO CHAMADOS
-- ============================================

ALTER TABLE chamados DROP CONSTRAINT IF EXISTS chamados_status_check;
ALTER TABLE chamados ADD CONSTRAINT chamados_status_check
  CHECK (status IN ('aberto', 'atribuido', 'em_atendimento', 'aguardando_peca', 'concluido', 'cancelado'));

-- ============================================
-- 2. TABELA DE AVALIAÇÕES
-- ============================================

CREATE TABLE IF NOT EXISTS avaliacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chamado_id UUID NOT NULL REFERENCES chamados(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(chamado_id)
);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_chamado ON avaliacoes(chamado_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_cliente ON avaliacoes(cliente_id);

-- ============================================
-- 3. TABELA DE CONFIGURAÇÕES (HORÁRIO COMERCIAL)
-- ============================================

CREATE TABLE IF NOT EXISTS configuracoes (
  chave VARCHAR(100) PRIMARY KEY,
  valor JSONB NOT NULL,
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO configuracoes (chave, valor) VALUES
  ('horario_comercial', '{"inicio": "08:00", "fim": "18:00", "dias": [1,2,3,4,5], "timezone": "America/Sao_Paulo"}'::jsonb)
ON CONFLICT (chave) DO NOTHING;

-- ============================================
-- 4. PUSH_TOKEN NA TABELA TECNICOS
-- ============================================

ALTER TABLE tecnicos ADD COLUMN IF NOT EXISTS push_token TEXT;

-- ============================================
-- 5. REMOVER TRIGGERS DE SLA (LÓGICA MOVIDA PARA NODE.JS)
-- A lógica de horário comercial é complexa demais para triggers SQL.
-- O cálculo de SLA agora é feito na camada de aplicação.
-- ============================================

DROP TRIGGER IF EXISTS tr_calcular_sla ON chamados;
DROP FUNCTION IF EXISTS calcular_sla();

DROP TRIGGER IF EXISTS tr_gerenciar_sla_pausa ON chamados;
DROP FUNCTION IF EXISTS gerenciar_sla_pausa();

-- Manter tr_atualizar_timestamp (continua útil)

-- ============================================
-- 6. RLS E REALTIME PARA NOVAS TABELAS
-- ============================================

ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_full_access" ON avaliacoes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON configuracoes FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE avaliacoes;
