const crypto = require('crypto');
const supabase = require('../services/supabase');
const { enriquecerSla } = require('../services/businessHours');

function gerarCodigoAcesso() {
  return 'BRK' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

exports.getPerfilCliente = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('id, nome, email, telefone, criado_em')
      .eq('id', req.usuario.id)
      .single();

    if (error) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
};

exports.getMeusChamados = async (req, res) => {
  try {
    const { status } = req.query;
    let query = supabase
      .from('chamados')
      .select(`
        id, numero, tipo, urgencia, descricao, status,
        sla_vence_em, sla_pausado_em, criado_em, atualizado_em,
        impressoras (modelo, numero_serie),
        tecnicos (nome)
      `)
      .eq('cliente_id', req.usuario.id)
      .order('criado_em', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    await enriquecerSla(data);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar chamados' });
  }
};

exports.getMinhasImpressoras = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('impressoras')
      .select('id, modelo, numero_serie, tipo_contrato, ativo')
      .eq('cliente_id', req.usuario.id)
      .eq('ativo', true)
      .order('modelo');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar impressoras' });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const { data: chamados, error } = await supabase
      .from('chamados')
      .select('status')
      .eq('cliente_id', req.usuario.id);

    if (error) throw error;

    const contadores = {
      abertos: 0,
      atribuidos: 0,
      em_atendimento: 0,
      aguardando_peca: 0,
      concluidos: 0,
      total: chamados.length
    };

    chamados.forEach(c => {
      if (c.status === 'aberto') contadores.abertos++;
      else if (c.status === 'atribuido') contadores.atribuidos++;
      else if (c.status === 'em_atendimento') contadores.em_atendimento++;
      else if (c.status === 'aguardando_peca') contadores.aguardando_peca++;
      else if (c.status === 'concluido') contadores.concluidos++;
    });

    res.json(contadores);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dashboard' });
  }
};

// Admin
exports.listarClientes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nome');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar clientes' });
  }
};

exports.getCliente = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select(`
        *,
        impressoras (id, modelo, numero_serie, tipo_contrato, ativo)
      `)
      .eq('id', req.params.id)
      .single();

    if (error) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
};

exports.criarCliente = async (req, res) => {
  try {
    const { nome, email, telefone } = req.body;
    if (!nome) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    if (nome.length > 200) {
      return res.status(400).json({ error: 'Nome deve ter no máximo 200 caracteres' });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Formato de e-mail inválido' });
    }

    const codigo_acesso = gerarCodigoAcesso();

    const { data, error } = await supabase
      .from('clientes')
      .insert({ nome, email, telefone, codigo_acesso })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
};

exports.atualizarCliente = async (req, res) => {
  try {
    const { nome, email, telefone } = req.body;

    const { data, error } = await supabase
      .from('clientes')
      .update({ nome, email, telefone })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
};

exports.gerarNovoCodigo = async (req, res) => {
  try {
    const codigo_acesso = gerarCodigoAcesso();

    const { data, error } = await supabase
      .from('clientes')
      .update({ codigo_acesso })
      .eq('id', req.params.id)
      .select('id, nome, codigo_acesso')
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar novo código' });
  }
};

exports.desativar = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Cliente excluído', data });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir cliente' });
  }
};
