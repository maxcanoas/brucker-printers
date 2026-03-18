const supabase = require('../services/supabase');

exports.registrarPushToken = async (req, res) => {
  try {
    const { push_token } = req.body;
    if (!push_token) {
      return res.status(400).json({ error: 'push_token é obrigatório' });
    }

    const { data, error } = await supabase
      .from('admins')
      .update({ push_token })
      .eq('id', req.usuario.id)
      .select('id, nome')
      .single();

    if (error) throw error;
    res.json({ message: 'Push token registrado', admin: data });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar push token' });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const { data: chamados, error } = await supabase
      .from('chamados')
      .select('status, sla_vence_em, sla_pausado_em, criado_em, atualizado_em');

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
      total_ativos: 0,
      total_geral: chamados.length
    };

    chamados.forEach(c => {
      if (c.status === 'aberto') dashboard.abertos++;
      if (c.status === 'em_atendimento') dashboard.em_atendimento++;
      if (c.status === 'aguardando_peca') dashboard.aguardando_peca++;

      if (c.status === 'concluido') {
        const atualizado = new Date(c.atualizado_em);
        if (atualizado >= hoje) dashboard.concluidos_hoje++;
      }

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

exports.relatorioPorPeriodo = async (req, res) => {
  try {
    const { inicio, fim } = req.query;
    if (!inicio || !fim) {
      return res.status(400).json({ error: 'Parâmetros inicio e fim são obrigatórios' });
    }

    const { data, error } = await supabase
      .from('chamados')
      .select(`
        *,
        clientes (nome),
        tecnicos (nome),
        relatorios_atendimento (duracao_minutos)
      `)
      .gte('criado_em', inicio)
      .lte('criado_em', fim)
      .order('criado_em', { ascending: false });

    if (error) throw error;

    const resumo = calcularResumo(data);
    res.json({ resumo, chamados: data });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
};

exports.relatorioPorCliente = async (req, res) => {
  try {
    const { inicio, fim } = req.query;

    let query = supabase
      .from('chamados')
      .select(`
        status, tipo, urgencia, sla_vence_em, atualizado_em,
        clientes (id, nome),
        relatorios_atendimento (duracao_minutos)
      `);

    if (inicio) query = query.gte('criado_em', inicio);
    if (fim) query = query.lte('criado_em', fim);

    const { data, error } = await query;
    if (error) throw error;

    // Agrupar por cliente
    const porCliente = {};
    data.forEach(c => {
      const clienteId = c.clientes?.id;
      if (!clienteId) return;

      if (!porCliente[clienteId]) {
        porCliente[clienteId] = {
          cliente: c.clientes.nome,
          total: 0,
          abertos: 0,
          concluidos: 0,
          dentro_sla: 0,
          fora_sla: 0
        };
      }

      const entry = porCliente[clienteId];
      entry.total++;
      if (c.status === 'aberto') entry.abertos++;
      if (c.status === 'concluido') {
        entry.concluidos++;
        if (c.sla_vence_em && new Date(c.atualizado_em) <= new Date(c.sla_vence_em)) {
          entry.dentro_sla++;
        } else {
          entry.fora_sla++;
        }
      }
    });

    res.json(Object.values(porCliente));
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar relatório por cliente' });
  }
};

exports.relatorioPorTecnico = async (req, res) => {
  try {
    const { inicio, fim } = req.query;

    let query = supabase
      .from('chamados')
      .select(`
        status, sla_vence_em, atualizado_em,
        tecnicos (id, nome),
        relatorios_atendimento (duracao_minutos)
      `)
      .not('tecnico_id', 'is', null);

    if (inicio) query = query.gte('criado_em', inicio);
    if (fim) query = query.lte('criado_em', fim);

    const { data, error } = await query;
    if (error) throw error;

    const porTecnico = {};
    data.forEach(c => {
      const tecnicoId = c.tecnicos?.id;
      if (!tecnicoId) return;

      if (!porTecnico[tecnicoId]) {
        porTecnico[tecnicoId] = {
          tecnico: c.tecnicos.nome,
          total: 0,
          concluidos: 0,
          dentro_sla: 0,
          tempo_medio: 0,
          _totalDuracao: 0,
          _countDuracao: 0
        };
      }

      const entry = porTecnico[tecnicoId];
      entry.total++;

      if (c.status === 'concluido') {
        entry.concluidos++;
        if (c.sla_vence_em && new Date(c.atualizado_em) <= new Date(c.sla_vence_em)) {
          entry.dentro_sla++;
        }
      }

      if (c.relatorios_atendimento?.length > 0) {
        c.relatorios_atendimento.forEach(r => {
          if (r.duracao_minutos) {
            entry._totalDuracao += r.duracao_minutos;
            entry._countDuracao++;
          }
        });
      }
    });

    const resultado = Object.values(porTecnico).map(t => {
      t.tempo_medio = t._countDuracao > 0 ? Math.round(t._totalDuracao / t._countDuracao) : 0;
      t.percentual_sla = t.concluidos > 0 ? Math.round((t.dentro_sla / t.concluidos) * 100) : 100;
      delete t._totalDuracao;
      delete t._countDuracao;
      return t;
    });

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar relatório por técnico' });
  }
};

function calcularResumo(chamados) {
  const resumo = {
    total: chamados.length,
    concluidos: 0,
    abertos: 0,
    em_atendimento: 0,
    dentro_sla: 0,
    fora_sla: 0,
    por_tipo: { preventivo: 0, corretivo: 0 },
    tempo_medio: 0
  };

  let totalDuracao = 0;
  let countDuracao = 0;

  chamados.forEach(c => {
    if (c.status === 'aberto') resumo.abertos++;
    if (c.status === 'em_atendimento') resumo.em_atendimento++;
    if (c.status === 'concluido') {
      resumo.concluidos++;
      if (c.sla_vence_em && new Date(c.atualizado_em) <= new Date(c.sla_vence_em)) {
        resumo.dentro_sla++;
      } else {
        resumo.fora_sla++;
      }
    }
    if (c.tipo) resumo.por_tipo[c.tipo]++;

    if (c.relatorios_atendimento?.length > 0) {
      c.relatorios_atendimento.forEach(r => {
        if (r.duracao_minutos) {
          totalDuracao += r.duracao_minutos;
          countDuracao++;
        }
      });
    }
  });

  resumo.tempo_medio = countDuracao > 0 ? Math.round(totalDuracao / countDuracao) : 0;
  resumo.percentual_sla = resumo.concluidos > 0
    ? Math.round((resumo.dentro_sla / resumo.concluidos) * 100)
    : 100;

  return resumo;
}
