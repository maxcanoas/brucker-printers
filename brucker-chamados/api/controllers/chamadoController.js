const supabase = require('../services/supabase');
const { notificarTecnico, notificarStatusChamado } = require('../services/whatsapp');
const { notificarTecnicoPush, notificarStatusPush, notificarNovoChamado } = require('../services/notifications');
const { notificarNovoChamadoEmail } = require('../services/email');

exports.criarChamado = async (req, res) => {
  try {
    const { impressora_id, tipo, urgencia, descricao } = req.body;

    if (!tipo || !descricao) {
      return res.status(400).json({ error: 'Tipo e descrição são obrigatórios' });
    }

    // Verificar se a impressora pertence ao cliente
    if (impressora_id) {
      const { data: imp } = await supabase
        .from('impressoras')
        .select('id, cliente_id')
        .eq('id', impressora_id)
        .eq('cliente_id', req.usuario.id)
        .single();

      if (!imp) {
        return res.status(400).json({ error: 'Impressora não encontrada ou não pertence a este cliente' });
      }
    }

    const sla_horas = urgencia === 'critica' ? 8 : urgencia === 'alta' ? 16 : 24;

    const { data, error } = await supabase
      .from('chamados')
      .insert({
        cliente_id: req.usuario.id,
        impressora_id,
        tipo,
        urgencia: urgencia || 'normal',
        descricao,
        sla_horas
      })
      .select(`
        *,
        impressoras (modelo, numero_serie)
      `)
      .single();

    if (error) throw error;

    // Registrar atualização
    await supabase.from('chamado_atualizacoes').insert({
      chamado_id: data.id,
      status_novo: 'aberto',
      observacao: 'Chamado aberto pelo cliente',
      usuario_tipo: 'cliente'
    });

    // Notificar admins via Push
    try {
      const { data: cliente } = await supabase
        .from('clientes')
        .select('nome')
        .eq('id', req.usuario.id)
        .single();
      await Promise.all([
        notificarNovoChamado(data, cliente),
        notificarNovoChamadoEmail(data, cliente),
      ]);
    } catch (notifError) {
      console.error('Erro ao notificar admins:', notifError);
    }

    res.status(201).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar chamado' });
  }
};

exports.listarTodos = async (req, res) => {
  try {
    const { status, cliente_id, tecnico_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('chamados')
      .select(`
        id, numero, tipo, urgencia, descricao, status,
        sla_vence_em, sla_pausado_em, sla_tempo_pausado,
        criado_em, atualizado_em,
        clientes (id, nome),
        impressoras (modelo, numero_serie),
        tecnicos (id, nome)
      `, { count: 'exact' })
      .order('criado_em', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);
    if (cliente_id) query = query.eq('cliente_id', cliente_id);
    if (tecnico_id) query = query.eq('tecnico_id', tecnico_id);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ data, total: count, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar chamados' });
  }
};

exports.getDashboardAdmin = async (req, res) => {
  try {
    const { data: chamados, error } = await supabase
      .from('chamados')
      .select('status, sla_vence_em, sla_pausado_em, criado_em');

    if (error) throw error;

    const agora = new Date();
    const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());

    const dashboard = {
      abertos: 0,
      em_atendimento: 0,
      aguardando_peca: 0,
      concluidos_hoje: 0,
      sla_vencendo: 0,
      sla_vencido: 0,
      total_ativos: 0
    };

    chamados.forEach(c => {
      if (c.status === 'aberto') dashboard.abertos++;
      if (c.status === 'em_atendimento') dashboard.em_atendimento++;
      if (c.status === 'aguardando_peca') dashboard.aguardando_peca++;

      if (c.status === 'concluido') {
        const criadoEm = new Date(c.criado_em);
        if (criadoEm >= hoje) dashboard.concluidos_hoje++;
      }

      // SLA check para chamados ativos
      if (['aberto', 'em_atendimento'].includes(c.status) && c.sla_vence_em) {
        const slaVence = new Date(c.sla_vence_em);
        const horasRestantes = (slaVence - agora) / (1000 * 60 * 60);

        if (horasRestantes <= 0) dashboard.sla_vencido++;
        else if (horasRestantes <= 6) dashboard.sla_vencendo++;
      }

      if (!['concluido', 'cancelado'].includes(c.status)) {
        dashboard.total_ativos++;
      }
    });

    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dashboard' });
  }
};

exports.atualizarChamado = async (req, res) => {
  try {
    const { status, tecnico_id, observacao } = req.body;

    // Buscar chamado atual
    const { data: chamadoAtual, error: fetchError } = await supabase
      .from('chamados')
      .select('*, clientes(nome), tecnicos(nome, whatsapp)')
      .eq('id', req.params.id)
      .single();

    if (fetchError) return res.status(404).json({ error: 'Chamado não encontrado' });

    const updates = {};
    if (status) updates.status = status;
    if (tecnico_id) updates.tecnico_id = tecnico_id;

    const { data, error } = await supabase
      .from('chamados')
      .update(updates)
      .eq('id', req.params.id)
      .select(`*, clientes(nome), impressoras(modelo, numero_serie), tecnicos(nome, whatsapp)`)
      .single();

    if (error) throw error;

    // Registrar atualização de status
    if (status && status !== chamadoAtual.status) {
      await supabase.from('chamado_atualizacoes').insert({
        chamado_id: data.id,
        status_anterior: chamadoAtual.status,
        status_novo: status,
        observacao: observacao || `Status alterado pelo admin`,
        usuario_tipo: 'admin'
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar chamado' });
  }
};

exports.atribuirTecnico = async (req, res) => {
  try {
    const { tecnico_id } = req.body;
    if (!tecnico_id) {
      return res.status(400).json({ error: 'tecnico_id é obrigatório' });
    }

    // Buscar técnico
    const { data: tecnico } = await supabase
      .from('tecnicos')
      .select('*')
      .eq('id', tecnico_id)
      .single();

    if (!tecnico) return res.status(404).json({ error: 'Técnico não encontrado' });

    // Atualizar chamado
    const { data: chamado, error } = await supabase
      .from('chamados')
      .update({ tecnico_id, status: 'em_atendimento' })
      .eq('id', req.params.id)
      .select(`*, clientes(nome), impressoras(modelo, numero_serie)`)
      .single();

    if (error) throw error;

    // Registrar atualização
    await supabase.from('chamado_atualizacoes').insert({
      chamado_id: chamado.id,
      status_anterior: 'aberto',
      status_novo: 'em_atendimento',
      observacao: `Técnico ${tecnico.nome} atribuído`,
      usuario_tipo: 'admin'
    });

    // Notificar técnico via WhatsApp
    try {
      await notificarTecnico(tecnico, chamado, chamado.clientes);
    } catch (whatsappError) {
      console.error('Erro ao notificar técnico:', whatsappError);
    }

    // Notificar técnico via Push
    try {
      await notificarTecnicoPush(tecnico, chamado, chamado.clientes);
    } catch (pushError) {
      console.error('Erro ao enviar push notification:', pushError);
    }

    res.json(chamado);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atribuir técnico' });
  }
};

exports.atualizarStatus = async (req, res) => {
  try {
    const { status, observacao } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status é obrigatório' });
    }

    const { data: chamadoAtual } = await supabase
      .from('chamados')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (!chamadoAtual) return res.status(404).json({ error: 'Chamado não encontrado' });

    // Técnico só pode atualizar chamados atribuídos a ele
    if (req.usuario.tipo === 'tecnico' && chamadoAtual.tecnico_id !== req.usuario.id) {
      return res.status(403).json({ error: 'Este chamado não está atribuído a você' });
    }

    // Não permitir concluir sem relatório
    if (status === 'concluido') {
      const { data: relatorio } = await supabase
        .from('relatorios_atendimento')
        .select('id')
        .eq('chamado_id', req.params.id)
        .single();

      if (!relatorio) {
        return res.status(400).json({ error: 'É necessário criar um relatório antes de concluir o chamado' });
      }
    }

    const { data, error } = await supabase
      .from('chamados')
      .update({ status })
      .eq('id', req.params.id)
      .select(`*, clientes(nome), impressoras(modelo, numero_serie), tecnicos(nome)`)
      .single();

    if (error) throw error;

    // Registrar atualização
    await supabase.from('chamado_atualizacoes').insert({
      chamado_id: data.id,
      status_anterior: chamadoAtual.status,
      status_novo: status,
      observacao: observacao || `Status atualizado por ${req.usuario.tipo}`,
      usuario_tipo: req.usuario.tipo
    });

    // Notificar via Push
    try {
      await notificarStatusPush(data, status);
    } catch (pushError) {
      console.error('Erro ao enviar push notification:', pushError);
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
};

exports.getChamadosTecnico = async (req, res) => {
  try {
    const { status } = req.query;
    let query = supabase
      .from('chamados')
      .select(`
        id, numero, tipo, urgencia, descricao, status,
        sla_vence_em, sla_pausado_em, sla_tempo_pausado,
        criado_em, atualizado_em,
        clientes (id, nome),
        impressoras (modelo, numero_serie)
      `)
      .eq('tecnico_id', req.usuario.id)
      .order('criado_em', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    } else {
      // Por padrão, mostrar apenas chamados ativos
      query = query.in('status', ['em_atendimento', 'aguardando_peca']);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar chamados' });
  }
};

exports.getDetalhesChamado = async (req, res) => {
  try {
    const { data: chamado, error } = await supabase
      .from('chamados')
      .select(`
        *,
        clientes (id, nome, email, telefone),
        impressoras (id, modelo, numero_serie, tipo_contrato),
        tecnicos (id, nome, email, whatsapp),
        chamado_atualizacoes (id, status_anterior, status_novo, observacao, usuario_tipo, criado_em),
        relatorios_atendimento (id, descricao_servico, pecas_utilizadas, duracao_minutos, criado_em)
      `)
      .eq('id', req.params.id)
      .single();

    if (error) return res.status(404).json({ error: 'Chamado não encontrado' });

    // Verificar permissão
    if (req.usuario.tipo === 'cliente' && chamado.cliente_id !== req.usuario.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    if (req.usuario.tipo === 'tecnico' && chamado.tecnico_id !== req.usuario.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    res.json(chamado);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar detalhes do chamado' });
  }
};
