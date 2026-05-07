-- ============================================
-- Brucker Printers - Sistema de Chamados
-- Migration Consolidada (Supabase)
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELAS
-- ============================================

-- Empresas clientes
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  codigo_acesso VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(20),
  push_token TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Impressoras cadastradas
CREATE TABLE impressoras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  modelo VARCHAR(255) NOT NULL,
  numero_serie VARCHAR(100) UNIQUE NOT NULL,
  tipo_contrato VARCHAR(50) DEFAULT 'locacao',
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Técnicos
CREATE TABLE tecnicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  whatsapp VARCHAR(20),
  push_token TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Administradores
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  push_token TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Sequência para número do chamado
CREATE SEQUENCE chamado_numero_seq START 1000;

-- Chamados
CREATE TABLE chamados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero INTEGER UNIQUE NOT NULL DEFAULT nextval('chamado_numero_seq'),
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  impressora_id UUID REFERENCES impressoras(id),
  tecnico_id UUID REFERENCES tecnicos(id),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('preventivo', 'corretivo')),
  urgencia VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (urgencia IN ('normal', 'alta', 'critica')),
  descricao TEXT NOT NULL,
  fotos JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(30) NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'atribuido', 'em_atendimento', 'aguardando_peca', 'concluido', 'cancelado')),
  sla_horas INTEGER DEFAULT 24,
  sla_vence_em TIMESTAMPTZ,
  sla_pausado_em TIMESTAMPTZ,
  sla_tempo_pausado INTEGER DEFAULT 0, -- minutos acumulados de pausa
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Atualizações de status
CREATE TABLE chamado_atualizacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chamado_id UUID NOT NULL REFERENCES chamados(id) ON DELETE CASCADE,
  status_anterior VARCHAR(30),
  status_novo VARCHAR(30) NOT NULL,
  observacao TEXT,
  usuario_tipo VARCHAR(20) DEFAULT 'admin', -- admin, tecnico, sistema
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Relatórios de atendimento
CREATE TABLE relatorios_atendimento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chamado_id UUID NOT NULL REFERENCES chamados(id) ON DELETE CASCADE,
  tecnico_id UUID NOT NULL REFERENCES tecnicos(id),
  descricao_servico TEXT NOT NULL,
  pecas_utilizadas TEXT,
  duracao_minutos INTEGER,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Avaliações dos chamados
CREATE TABLE avaliacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chamado_id UUID NOT NULL REFERENCES chamados(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(chamado_id)
);

-- Configurações do sistema (horário comercial, etc.)
CREATE TABLE configuracoes (
  chave VARCHAR(100) PRIMARY KEY,
  valor JSONB NOT NULL,
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX idx_impressoras_cliente ON impressoras(cliente_id);
CREATE INDEX idx_impressoras_serie ON impressoras(numero_serie);
CREATE INDEX idx_chamados_cliente ON chamados(cliente_id);
CREATE INDEX idx_chamados_tecnico ON chamados(tecnico_id);
CREATE INDEX idx_chamados_status ON chamados(status);
CREATE INDEX idx_chamados_sla ON chamados(sla_vence_em);
CREATE INDEX idx_atualizacoes_chamado ON chamado_atualizacoes(chamado_id);
CREATE INDEX idx_relatorios_chamado ON relatorios_atendimento(chamado_id);
CREATE INDEX idx_avaliacoes_chamado ON avaliacoes(chamado_id);
CREATE INDEX idx_avaliacoes_cliente ON avaliacoes(cliente_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- NOTA: A lógica de cálculo de SLA com horário comercial é feita na camada de
-- aplicação (Node.js), não em triggers SQL — é complexa demais para triggers.

-- Atualizar timestamp ao modificar chamado
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_atualizar_timestamp
  BEFORE UPDATE ON chamados
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE impressoras ENABLE ROW LEVEL SECURITY;
ALTER TABLE chamados ENABLE ROW LEVEL SECURITY;
ALTER TABLE chamado_atualizacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE relatorios_atendimento ENABLE ROW LEVEL SECURITY;
ALTER TABLE tecnicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- Policies para service_role (API backend usa service_role key)
-- O backend controla o acesso via lógica de aplicação
CREATE POLICY "service_role_full_access" ON clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON impressoras FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON chamados FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON chamado_atualizacoes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON relatorios_atendimento FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON tecnicos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON admins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON avaliacoes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON configuracoes FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- REALTIME
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE chamados;
ALTER PUBLICATION supabase_realtime ADD TABLE chamado_atualizacoes;
ALTER PUBLICATION supabase_realtime ADD TABLE avaliacoes;

-- ============================================
-- DADOS INICIAIS (seed)
-- ============================================

INSERT INTO configuracoes (chave, valor) VALUES
  ('horario_comercial', '{"inicio": "08:00", "fim": "18:00", "dias": [1,2,3,4,5], "timezone": "America/Sao_Paulo"}'::jsonb)
ON CONFLICT (chave) DO NOTHING;

-- Admin padrão (criar user no Supabase Auth primeiro)
-- INSERT INTO admins (nome, email) VALUES ('Luciano', 'luciano@bruckerprinters.com.br');
