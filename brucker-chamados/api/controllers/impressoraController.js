const supabase = require('../services/supabase');

exports.buscarPorSerie = async (req, res) => {
  try {
    const { numero_serie } = req.params;
    let query = supabase
      .from('impressoras')
      .select('id, modelo, numero_serie, tipo_contrato, cliente_id')
      .eq('ativo', true);

    // Se é cliente, só pode buscar suas próprias impressoras
    if (req.usuario.tipo === 'cliente') {
      query = query.eq('cliente_id', req.usuario.id);
    }

    const { data, error } = await query.eq('numero_serie', numero_serie).single();

    if (error) return res.status(404).json({ error: 'Impressora não encontrada' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar impressora' });
  }
};

exports.listar = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('impressoras')
      .select(`
        id, modelo, numero_serie, tipo_contrato, ativo, criado_em,
        clientes (id, nome)
      `)
      .order('modelo');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar impressoras' });
  }
};

exports.listarPorCliente = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('impressoras')
      .select('id, modelo, numero_serie, tipo_contrato, ativo')
      .eq('cliente_id', req.params.cliente_id)
      .order('modelo');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar impressoras' });
  }
};

exports.criar = async (req, res) => {
  try {
    const { cliente_id, modelo, numero_serie, tipo_contrato } = req.body;
    if (!cliente_id || !modelo || !numero_serie) {
      return res.status(400).json({ error: 'cliente_id, modelo e numero_serie são obrigatórios' });
    }

    if (tipo_contrato && !['locacao', 'venda', 'manutencao'].includes(tipo_contrato)) {
      return res.status(400).json({ error: 'Tipo de contrato inválido' });
    }

    if (numero_serie.length > 100) {
      return res.status(400).json({ error: 'Número de série deve ter no máximo 100 caracteres' });
    }

    const { data, error } = await supabase
      .from('impressoras')
      .insert({ cliente_id, modelo, numero_serie, tipo_contrato: tipo_contrato || 'locacao' })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Número de série já cadastrado' });
      }
      throw error;
    }
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar impressora' });
  }
};

exports.atualizar = async (req, res) => {
  try {
    const { modelo, numero_serie, tipo_contrato, ativo } = req.body;

    const { data, error } = await supabase
      .from('impressoras')
      .update({ modelo, numero_serie, tipo_contrato, ativo })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar impressora' });
  }
};

exports.desativar = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('impressoras')
      .update({ ativo: false })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Impressora desativada', data });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao desativar impressora' });
  }
};
