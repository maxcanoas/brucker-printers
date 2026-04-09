const supabase = require('../services/supabase');
const { notificarTecnico, notificarStatusChamado, notificarAdminWhatsApp, notificarClienteConcluidoWhatsApp } = require('../services/whatsapp');
const { notificarTecnicoPush, notificarStatusPush, notificarNovoChamado } = require('../services/notifications');
const { notificarNovoChamadoEmail, notificarClienteStatusEmail, notificarTecnicoAtribuidoEmail, notificarChamadoConcluidoEmail } = require('../services/email');
const { calcularSlaVenceEm, enriquecerSla, recalcularSlaAposResumo } = require('../services/businessHours');

exports.criarChamado = async (req, res) => {
  try {
    const { impressora_id, tipo, urgencia, descricao } = req.body;

    if (!tipo || !descricao) {
      return res.status(400).json({ error: 'Tipo e descrição são obrigatórios' });
    }

    if (!['preventivo', 'corretivo'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo deve ser preventivo ou corretivo' });
    }

    if (urgencia && !['normal', 'alta', 'critica'].includes(urgencia)) {
      return res.status(400).json({ error: 'Urgência deve ser normal, alta ou critica' });
    }

    if (descricao.length > 2000) {
      return res.status(400).json({ error: 'Descrição deve ter no máximo 2000 caracteres' });
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

    // SLA fixo em 24 horas
    const sla_horas = 24;
    const agora = new Date();
    const sla_vence_em = await calcularSlaVenceEm(agora, sla_horas);

    const { data, error } = await supabase
      .from('chamados')
      .insert({
        cliente_id: req.usuario.id,
        impressora_id,
        tipo,
        urgencia: urgencia || 'normal',
        descricao,
        sla_horas,
        sla_vence_em: sla_vence_em.toISOString()
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

    // Notificar admins via Push, Email e WhatsApp (fire-and-forget)
    supabase
      .from('clientes')
      .select('nome')
      .eq('id', req.usuario.id)
      .single()
      .then(({ data: cliente }) => {
        Promise.all([
          notificarNovoChamado(data, cliente),
          notificarNovoChamadoEmail(data, cliente),
          notificarAdminWhatsApp(data, cliente, 'novo_chamado'),
        ]).catch(e => console.error('Erro ao notificar admins:', e));
      })
      .catch(e => console.error('Erro ao buscar cliente para notificação:', e));

    await enriquecerSla(data);
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

    await enriquecerSla(data);
    res.json({ data, total: count, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar chamados' });
  }
};

exports.getDashboardAdmin = async (req, res) => {
  try {
    const { data: chamados, error } = await supabase
      .from('chamados')
      .select('status, sla_vence_em, sla_pausado_em, sla_tempo_pausado, criado_em');

    if (error) throw error;

    const agora = new Date();
    const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());

    const dashboard = {
      abertos: 0,
      atribuidos: 0,
      em_atendimento: 0,
      aguardando_peca: 0,
      concluidos_hoje: 0,
      sla_vencendo: 0,
      sla_vencido: 0,
      total_ativos: 0
    };

    // Enriquecer com SLA para cálculos precisos
    await enriquecerSla(chamados);

    chamados.forEach(c => {
      if (c.status === 'aberto') dashboard.abertos++;
      if (c.status === 'atribuido') dashboard.atribuidos++;
      if (c.status === 'em_atendimento') dashboard.em_atendimento++;
      if (c.status === 'aguardando_peca') dashboard.aguardando_peca++;

      if (c.status === 'concluido') {
        const criadoEm = new Date(c.criado_em);
        if (criadoEm >= hoje) dashboard.concluidos_hoje++;
      }

      // SLA check para chamados ativos usando tempo restante calculado
      if (['aberto', 'atribuido', 'em_atendimento'].includes(c.status) && c.sla_tempo_restante_minutos !== null) {
        const minutosRestantes = c.sla_tempo_restante_minutos;
        if (minutosRestantes <= 0) dashboard.sla_vencido++;
        else if (minutosRestantes <= 360) dashboard.sla_vencendo++; // 6 horas = 360 min
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

    if (status) {
      const statusValidos = ['aberto', 'atribuido', 'em_atendimento', 'aguardando_peca', 'concluido', 'cancelado'];
      if (!statusValidos.includes(status)) {
        return res.status(400).json({ error: `Status inválido. Use: ${statusValidos.join(', ')}` });
      }
    }

    // Buscar chamado atual
    const { data: chamadoAtual, error: fetchError } = await supabase
      .from('chamados')
      .select('*, clientes(id, nome, email, telefone), tecnicos(nome, whatsapp, push_token)')
      .eq('id', req.params.id)
      .single();

    if (fetchError) return res.status(404).json({ error: 'Chamado não encontrado' });

    // Bloquear alterações em chamados concluídos ou cancelados
    if (['concluido', 'cancelado'].includes(chamadoAtual.status)) {
      return res.status(400).json({ error: `Chamados ${chamadoAtual.status === 'concluido' ? 'concluídos' : 'cancelados'} não podem ser alterados` });
    }

    const updates = {};
    if (status) updates.status = status;
    if (tecnico_id) updates.tecnico_id = tecnico_id;

    // Gerenciar pausa/retomada do SLA na camada de aplicação
    if (status === 'aguardando_peca' && chamadoAtual.status !== 'aguardando_peca') {
      updates.sla_pausado_em = new Date().toISOString();
    }
    if (chamadoAtual.status === 'aguardando_peca' && status && status !== 'aguardando_peca') {
      const novoVencimento = await recalcularSlaAposResumo(chamadoAtual);
      updates.sla_vence_em = novoVencimento.toISOString();
      updates.sla_pausado_em = null;
      const pausadoEm = new Date(chamadoAtual.sla_pausado_em);
      const agora = new Date();
      const minutosPausa = Math.floor((agora - pausadoEm) / (1000 * 60));
      updates.sla_tempo_pausado = (chamadoAtual.sla_tempo_pausado || 0) + minutosPausa;
    }

    const { data, error } = await supabase
      .from('chamados')
      .update(updates)
      .eq('id', req.params.id)
      .select(`*, clientes(id, nome, email, telefone), impressoras(modelo, numero_serie), tecnicos(nome, whatsapp, push_token)`)
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

      // Notificar cliente por email sobre mudança de status (fire-and-forget)
      if (data.clientes) {
        notificarClienteStatusEmail(data.clientes, data, status)
          .catch(e => console.error('Erro ao notificar cliente:', e));
      }
    }

    await enriquecerSla(data);
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

    // Buscar chamado atual para verificar status
    const { data: chamadoAtual } = await supabase
      .from('chamados')
      .select('status, clientes(id, nome, email, telefone)')
      .eq('id', req.params.id)
      .single();

    if (!chamadoAtual) return res.status(404).json({ error: 'Chamado não encontrado' });

    if (['concluido', 'cancelado'].includes(chamadoAtual.status)) {
      return res.status(400).json({ error: 'Não é possível atribuir técnico a chamado concluído ou cancelado' });
    }

    // Buscar técnico
    const { data: tecnico } = await supabase
      .from('tecnicos')
      .select('*')
      .eq('id', tecnico_id)
      .single();

    if (!tecnico) return res.status(404).json({ error: 'Técnico não encontrado' });

    // Atualizar chamado — status vai para "atribuido" (técnico precisa aceitar)
    const { data: chamado, error } = await supabase
      .from('chamados')
      .update({ tecnico_id, status: 'atribuido' })
      .eq('id', req.params.id)
      .select(`*, clientes(id, nome, email, telefone), impressoras(modelo, numero_serie)`)
      .single();

    if (error) throw error;

    // Registrar atualização
    await supabase.from('chamado_atualizacoes').insert({
      chamado_id: chamado.id,
      status_anterior: chamadoAtual.status,
      status_novo: 'atribuido',
      observacao: `Técnico ${tecnico.nome} atribuído — aguardando aceite`,
      usuario_tipo: 'admin'
    });

    // Notificar técnico via WhatsApp, Push e Email (fire-and-forget)
    Promise.all([
      notificarTecnico(tecnico, chamado, chamado.clientes),
      notificarTecnicoPush(tecnico, chamado, chamado.clientes),
      notificarTecnicoAtribuidoEmail(tecnico, chamado, chamado.clientes),
    ]).catch(e => console.error('Erro ao notificar técnico:', e));

    // Notificar cliente por email (fire-and-forget)
    if (chamado.clientes) {
      notificarClienteStatusEmail(chamado.clientes, chamado, 'atribuido')
        .catch(e => console.error('Erro ao notificar cliente:', e));
    }

    await enriquecerSla(chamado);
    res.json(chamado);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atribuir técnico' });
  }
};

// Técnico aceita chamado atribuído
exports.aceitarChamado = async (req, res) => {
  try {
    const { data: chamado } = await supabase
      .from('chamados')
      .select('*, clientes(id, nome, email, telefone), tecnicos(id, nome)')
      .eq('id', req.params.id)
      .single();

    if (!chamado) return res.status(404).json({ error: 'Chamado não encontrado' });

    if (chamado.status !== 'atribuido') {
      return res.status(400).json({ error: 'Apenas chamados com status "atribuído" podem ser aceitos' });
    }

    if (chamado.tecnico_id !== req.usuario.id) {
      return res.status(403).json({ error: 'Este chamado não está atribuído a você' });
    }

    const { data: chamadosAtivos } = await supabase
      .from('chamados')
      .select('id')
      .eq('tecnico_id', req.usuario.id)
      .eq('status', 'em_atendimento')
      .limit(1);

    if (chamadosAtivos && chamadosAtivos.length > 0) {
      return res.status(400).json({ error: 'Você já possui um chamado em atendimento. Encerre-o antes de aceitar outro.' });
    }

    const { data, error } = await supabase
      .from('chamados')
      .update({ status: 'em_atendimento' })
      .eq('id', req.params.id)
      .select(`*, clientes(id, nome, email, telefone), impressoras(modelo, numero_serie), tecnicos(id, nome)`)
      .single();

    if (error) throw error;

    // Registrar atualização
    await supabase.from('chamado_atualizacoes').insert({
      chamado_id: data.id,
      status_anterior: 'atribuido',
      status_novo: 'em_atendimento',
      observacao: `Chamado aceito pelo técnico ${chamado.tecnicos?.nome || ''}`,
      usuario_tipo: 'tecnico'
    });

    // Notificar admin via push e cliente via email (fire-and-forget)
    Promise.all([
      notificarStatusPush(data, 'em_atendimento'),
      data.clientes ? notificarClienteStatusEmail(data.clientes, data, 'em_atendimento') : Promise.resolve(),
    ]).catch(e => console.error('Erro ao notificar sobre aceite:', e));

    await enriquecerSla(data);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao aceitar chamado' });
  }
};

// Cliente cancela chamado
exports.cancelarChamado = async (req, res) => {
  try {
    const { data: chamado } = await supabase
      .from('chamados')
      .select('*, clientes(id, nome, email, telefone), tecnicos(id, nome, whatsapp, push_token)')
      .eq('id', req.params.id)
      .single();

    if (!chamado) return res.status(404).json({ error: 'Chamado não encontrado' });

    if (chamado.cliente_id !== req.usuario.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    if (['concluido', 'cancelado'].includes(chamado.status)) {
      return res.status(400).json({ error: `Chamado já está ${chamado.status === 'concluido' ? 'concluído' : 'cancelado'}` });
    }

    const { data, error } = await supabase
      .from('chamados')
      .update({ status: 'cancelado' })
      .eq('id', req.params.id)
      .select(`*, clientes(id, nome, email, telefone), impressoras(modelo, numero_serie), tecnicos(id, nome)`)
      .single();

    if (error) throw error;

    // Registrar atualização
    await supabase.from('chamado_atualizacoes').insert({
      chamado_id: data.id,
      status_anterior: chamado.status,
      status_novo: 'cancelado',
      observacao: 'Chamado cancelado pelo cliente',
      usuario_tipo: 'cliente'
    });

    // Notificar admin e técnico (fire-and-forget)
    notificarStatusPush(data, 'cancelado')
      .catch(e => console.error('Erro ao notificar sobre cancelamento:', e));

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cancelar chamado' });
  }
};

exports.atualizarStatus = async (req, res) => {
  try {
    const { status, observacao } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status é obrigatório' });
    }

    const statusValidos = ['aberto', 'atribuido', 'em_atendimento', 'aguardando_peca', 'concluido', 'cancelado'];
    if (!statusValidos.includes(status)) {
      return res.status(400).json({ error: `Status inválido. Use: ${statusValidos.join(', ')}` });
    }

    const { data: chamadoAtual } = await supabase
      .from('chamados')
      .select('*, clientes(id, nome, email, telefone)')
      .eq('id', req.params.id)
      .single();

    if (!chamadoAtual) return res.status(404).json({ error: 'Chamado não encontrado' });

    // Bloquear alterações em chamados concluídos ou cancelados
    if (['concluido', 'cancelado'].includes(chamadoAtual.status)) {
      return res.status(400).json({ error: `Chamados ${chamadoAtual.status === 'concluido' ? 'concluídos' : 'cancelados'} não podem ser alterados` });
    }

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

    const updates = { status };

    // Gerenciar pausa/retomada do SLA
    if (status === 'aguardando_peca' && chamadoAtual.status !== 'aguardando_peca') {
      updates.sla_pausado_em = new Date().toISOString();
    }
    if (chamadoAtual.status === 'aguardando_peca' && status !== 'aguardando_peca') {
      const novoVencimento = await recalcularSlaAposResumo(chamadoAtual);
      updates.sla_vence_em = novoVencimento.toISOString();
      updates.sla_pausado_em = null;
      const pausadoEm = new Date(chamadoAtual.sla_pausado_em);
      const agora = new Date();
      const minutosPausa = Math.floor((agora - pausadoEm) / (1000 * 60));
      updates.sla_tempo_pausado = (chamadoAtual.sla_tempo_pausado || 0) + minutosPausa;
    }

    const { data, error } = await supabase
      .from('chamados')
      .update(updates)
      .eq('id', req.params.id)
      .select(`*, clientes(id, nome, email, telefone), impressoras(modelo, numero_serie), tecnicos(id, nome)`)
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

    // Notificar via Push (fire-and-forget)
    notificarStatusPush(data, status)
      .catch(e => console.error('Erro ao enviar push notification:', e));

    // Notificar cliente por email sobre mudança de status (fire-and-forget)
    if (data.clientes) {
      if (status === 'concluido') {
        Promise.all([
          notificarChamadoConcluidoEmail(data.clientes, data),
          notificarClienteConcluidoWhatsApp(data.clientes.telefone, data),
        ]).catch(e => console.error('Erro ao notificar cliente:', e));
      } else {
        notificarClienteStatusEmail(data.clientes, data, status)
          .catch(e => console.error('Erro ao notificar cliente:', e));
      }
    }

    await enriquecerSla(data);
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
      // Por padrão, mostrar chamados ativos (incluindo atribuídos aguardando aceite)
      query = query.in('status', ['atribuido', 'em_atendimento', 'aguardando_peca']);
    }

    const { data, error } = await query;
    if (error) throw error;

    await enriquecerSla(data);
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
        relatorios_atendimento (id, descricao_servico, pecas_utilizadas, duracao_minutos, criado_em),
        avaliacoes (id, nota, comentario, criado_em)
      `)
      .eq('id', req.params.id)
      .single();

    if (error) return res.status(404).json({ error: 'Chamado não encontrado' });

    // Normalizar avaliacoes: Supabase retorna objeto (não array) para relações 1-para-1
    // devido à constraint UNIQUE(chamado_id). Envolver em array para compatibilidade.
    if (chamado.avaliacoes && !Array.isArray(chamado.avaliacoes)) {
      chamado.avaliacoes = [chamado.avaliacoes];
    }

    // Verificar permissão
    if (req.usuario.tipo === 'cliente' && chamado.cliente_id !== req.usuario.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    if (req.usuario.tipo === 'tecnico' && chamado.tecnico_id !== req.usuario.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    await enriquecerSla(chamado);
    res.json(chamado);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar detalhes do chamado' });
  }
};

// Avaliação do atendimento pelo cliente
exports.criarAvaliacao = async (req, res) => {
  try {
    const { nota, comentario } = req.body;

    if (!nota || nota < 1 || nota > 5) {
      return res.status(400).json({ error: 'Nota deve ser entre 1 e 5' });
    }

    // Buscar chamado
    const { data: chamado } = await supabase
      .from('chamados')
      .select('id, status, cliente_id')
      .eq('id', req.params.id)
      .single();

    if (!chamado) return res.status(404).json({ error: 'Chamado não encontrado' });

    if (chamado.cliente_id !== req.usuario.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    if (chamado.status !== 'concluido') {
      return res.status(400).json({ error: 'Apenas chamados concluídos podem ser avaliados' });
    }

    // Verificar se já existe avaliação
    const { data: existente } = await supabase
      .from('avaliacoes')
      .select('id')
      .eq('chamado_id', req.params.id)
      .single();

    if (existente) {
      return res.status(400).json({ error: 'Este chamado já foi avaliado' });
    }

    const { data, error } = await supabase
      .from('avaliacoes')
      .insert({
        chamado_id: req.params.id,
        cliente_id: req.usuario.id,
        nota: Math.round(nota),
        comentario: comentario || null
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar avaliação' });
  }
};

exports.getAvaliacao = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('avaliacoes')
      .select('*')
      .eq('chamado_id', req.params.id)
      .single();

    if (error) return res.status(404).json({ error: 'Avaliação não encontrada' });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar avaliação' });
  }
};

exports.listarAvaliacoes = async (req, res) => {
  try {
    const { nota, tecnico_id, cliente_id, inicio, fim, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('avaliacoes')
      .select(`
        id, nota, comentario, criado_em,
        clientes (id, nome),
        chamados (id, numero, tecnico_id, tecnicos (id, nome))
      `, { count: 'exact' })
      .order('criado_em', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (nota) query = query.eq('nota', Number(nota));
    if (cliente_id) query = query.eq('cliente_id', cliente_id);
    if (inicio) query = query.gte('criado_em', inicio);
    if (fim) query = query.lte('criado_em', fim + 'T23:59:59');

    const { data, error, count } = await query;
    if (error) throw error;

    let filtered = data;
    if (tecnico_id) {
      filtered = data.filter(a => a.chamados?.tecnico_id === tecnico_id);
    }

    const allNotas = filtered.map(a => a.nota);
    const stats = {
      total: count || 0,
      media: allNotas.length ? (allNotas.reduce((s, n) => s + n, 0) / allNotas.length).toFixed(1) : '0',
      distribuicao: [1, 2, 3, 4, 5].map(n => ({ nota: n, count: allNotas.filter(x => x === n).length }))
    };

    res.json({ data: filtered, stats, total: count, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar avaliações' });
  }
};
