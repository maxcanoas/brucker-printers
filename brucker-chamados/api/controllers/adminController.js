const supabase = require('../services/supabase');
const { enriquecerSla } = require('../services/businessHours');
const { gerarRelatorioAgregadoPDF, statusTexto } = require('../services/pdf');
const {
  gerarRelatorioPeriodoExcel,
  gerarRelatorioClientesExcel,
  gerarRelatorioTecnicosExcel,
  gerarRelatorioSlaExcel,
  gerarRelatorioPecasExcel,
} = require('../services/excel');

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
      .select('status, sla_vence_em, sla_pausado_em, sla_tempo_pausado, criado_em, atualizado_em');

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
      total_ativos: 0,
      total_geral: chamados.length
    };

    await enriquecerSla(chamados);

    chamados.forEach(c => {
      if (c.status === 'aberto') dashboard.abertos++;
      if (c.status === 'atribuido') dashboard.atribuidos++;
      if (c.status === 'em_atendimento') dashboard.em_atendimento++;
      if (c.status === 'aguardando_peca') dashboard.aguardando_peca++;

      if (c.status === 'concluido') {
        const atualizado = new Date(c.atualizado_em);
        if (atualizado >= hoje) dashboard.concluidos_hoje++;
      }

      if (['aberto', 'atribuido', 'em_atendimento'].includes(c.status) && c.sla_tempo_restante_minutos !== null) {
        if (c.sla_tempo_restante_minutos <= 0) dashboard.sla_vencido++;
        else if (c.sla_tempo_restante_minutos <= 360) dashboard.sla_vencendo++;
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

// ============================================
// RELATÓRIOS
// ============================================

function calcularResumo(chamados) {
  const resumo = {
    total: chamados.length,
    concluidos: 0,
    abertos: 0,
    atribuidos: 0,
    em_atendimento: 0,
    aguardando_peca: 0,
    dentro_sla: 0,
    fora_sla: 0,
    por_tipo: { preventivo: 0, corretivo: 0 },
    tempo_medio: 0
  };

  let totalDuracao = 0;
  let countDuracao = 0;

  chamados.forEach(c => {
    if (c.status === 'aberto') resumo.abertos++;
    if (c.status === 'atribuido') resumo.atribuidos++;
    if (c.status === 'em_atendimento') resumo.em_atendimento++;
    if (c.status === 'aguardando_peca') resumo.aguardando_peca++;
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

exports.relatorioPorPeriodo = async (req, res) => {
  try {
    const { inicio, fim, formato } = req.query;
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

    if (formato === 'xlsx') {
      const buffer = await gerarRelatorioPeriodoExcel(resumo, data);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=relatorio-periodo.xlsx');
      return res.send(Buffer.from(buffer));
    }

    if (formato === 'pdf') {
      const resumoLinhas = [
        ['Total de Chamados', resumo.total],
        ['Concluídos', resumo.concluidos],
        ['Dentro do SLA', resumo.dentro_sla],
        ['Fora do SLA', resumo.fora_sla],
        ['% SLA Cumprido', `${resumo.percentual_sla}%`],
        ['Tempo Médio (min)', resumo.tempo_medio],
      ];
      const colunas = [
        { header: '#', key: 'numero', width: 50 },
        { header: 'Status', key: 'status', width: 80 },
        { header: 'Tipo', key: 'tipo', width: 70 },
        { header: 'Cliente', key: 'cliente', width: 120 },
        { header: 'Técnico', key: 'tecnico', width: 100 },
        { header: 'Criado em', key: 'criado_em', width: 100 },
        { header: 'SLA', key: 'sla', width: 70 },
      ];
      const linhas = data.map(c => ({
        numero: c.numero,
        status: statusTexto[c.status] || c.status,
        tipo: c.tipo === 'preventivo' ? 'Preventivo' : 'Corretivo',
        cliente: c.clientes?.nome || '-',
        tecnico: c.tecnicos?.nome || '-',
        criado_em: new Date(c.criado_em).toLocaleDateString('pt-BR'),
        sla: c.status === 'concluido' && c.sla_vence_em
          ? (new Date(c.atualizado_em) <= new Date(c.sla_vence_em) ? 'OK' : 'Estourado')
          : '-',
      }));

      const pdfBuffer = await gerarRelatorioAgregadoPDF(
        `Relatório por Período — ${new Date(inicio).toLocaleDateString('pt-BR')} a ${new Date(fim).toLocaleDateString('pt-BR')}`,
        resumoLinhas, colunas, linhas
      );
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=relatorio-periodo.pdf');
      return res.send(pdfBuffer);
    }

    res.json({ resumo, chamados: data });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
};

exports.relatorioPorCliente = async (req, res) => {
  try {
    const { inicio, fim, formato } = req.query;

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

    const resultado = Object.values(porCliente);

    if (formato === 'xlsx') {
      const buffer = await gerarRelatorioClientesExcel(resultado);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=relatorio-clientes.xlsx');
      return res.send(Buffer.from(buffer));
    }

    if (formato === 'pdf') {
      const colunas = [
        { header: 'Cliente', key: 'cliente', width: 150 },
        { header: 'Total', key: 'total', width: 60 },
        { header: 'Abertos', key: 'abertos', width: 60 },
        { header: 'Concluídos', key: 'concluidos', width: 70 },
        { header: 'Dentro SLA', key: 'dentro_sla', width: 70 },
        { header: 'Fora SLA', key: 'fora_sla', width: 70 },
      ];
      const pdfBuffer = await gerarRelatorioAgregadoPDF('Relatório por Cliente', null, colunas, resultado);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=relatorio-clientes.pdf');
      return res.send(pdfBuffer);
    }

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar relatório por cliente' });
  }
};

exports.relatorioPorTecnico = async (req, res) => {
  try {
    const { inicio, fim, formato } = req.query;

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

    if (formato === 'xlsx') {
      const buffer = await gerarRelatorioTecnicosExcel(resultado);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=relatorio-tecnicos.xlsx');
      return res.send(Buffer.from(buffer));
    }

    if (formato === 'pdf') {
      const colunas = [
        { header: 'Técnico', key: 'tecnico', width: 130 },
        { header: 'Total', key: 'total', width: 60 },
        { header: 'Concluídos', key: 'concluidos', width: 70 },
        { header: 'Dentro SLA', key: 'dentro_sla', width: 70 },
        { header: '% SLA', key: 'percentual_sla', width: 60 },
        { header: 'Tempo Médio', key: 'tempo_medio', width: 80 },
      ];
      const linhas = resultado.map(r => ({ ...r, percentual_sla: `${r.percentual_sla}%`, tempo_medio: `${r.tempo_medio} min` }));
      const pdfBuffer = await gerarRelatorioAgregadoPDF('Relatório por Técnico', null, colunas, linhas);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=relatorio-tecnicos.pdf');
      return res.send(pdfBuffer);
    }

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar relatório por técnico' });
  }
};

// Relatório de SLA (cumprido vs estourado)
exports.relatorioSla = async (req, res) => {
  try {
    const { inicio, fim, formato } = req.query;
    if (!inicio || !fim) {
      return res.status(400).json({ error: 'Parâmetros inicio e fim são obrigatórios' });
    }

    const { data: chamados, error } = await supabase
      .from('chamados')
      .select(`
        *,
        clientes (nome),
        tecnicos (nome)
      `)
      .eq('status', 'concluido')
      .gte('criado_em', inicio)
      .lte('criado_em', fim)
      .order('criado_em', { ascending: false });

    if (error) throw error;

    let dentroSla = 0;
    let foraSla = 0;

    const chamadosComSla = chamados.map(c => {
      const cumprido = c.sla_vence_em && new Date(c.atualizado_em) <= new Date(c.sla_vence_em);
      if (cumprido) dentroSla++;
      else foraSla++;
      return { ...c, sla_cumprido: cumprido };
    });

    const resultado = {
      resumo: {
        total_concluidos: chamados.length,
        dentro_sla: dentroSla,
        fora_sla: foraSla,
        percentual_sla: chamados.length > 0 ? Math.round((dentroSla / chamados.length) * 100) : 100,
      },
      chamados: chamadosComSla,
    };

    if (formato === 'xlsx') {
      const buffer = await gerarRelatorioSlaExcel(resultado);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=relatorio-sla.xlsx');
      return res.send(Buffer.from(buffer));
    }

    if (formato === 'pdf') {
      const resumoLinhas = [
        ['Total Concluídos', resultado.resumo.total_concluidos],
        ['Dentro do SLA', resultado.resumo.dentro_sla],
        ['Fora do SLA', resultado.resumo.fora_sla],
        ['% Cumprimento', `${resultado.resumo.percentual_sla}%`],
      ];
      const colunas = [
        { header: '#', key: 'numero', width: 50 },
        { header: 'Cliente', key: 'cliente', width: 120 },
        { header: 'Técnico', key: 'tecnico', width: 100 },
        { header: 'Urgência', key: 'urgencia', width: 70 },
        { header: 'SLA', key: 'sla_status', width: 70 },
        { header: 'Criado', key: 'criado_em', width: 90 },
        { header: 'Concluído', key: 'concluido_em', width: 90 },
      ];
      const linhas = chamadosComSla.map(c => ({
        numero: c.numero,
        cliente: c.clientes?.nome || '-',
        tecnico: c.tecnicos?.nome || '-',
        urgencia: c.urgencia,
        sla_status: c.sla_cumprido ? 'Cumprido' : 'Estourado',
        criado_em: new Date(c.criado_em).toLocaleDateString('pt-BR'),
        concluido_em: new Date(c.atualizado_em).toLocaleDateString('pt-BR'),
      }));

      const pdfBuffer = await gerarRelatorioAgregadoPDF('Relatório de SLA', resumoLinhas, colunas, linhas);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=relatorio-sla.pdf');
      return res.send(pdfBuffer);
    }

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar relatório de SLA' });
  }
};

// Relatório de peças utilizadas
exports.relatorioPecas = async (req, res) => {
  try {
    const { inicio, fim, cliente_id, tecnico_id, formato } = req.query;

    let query = supabase
      .from('relatorios_atendimento')
      .select(`
        id, pecas_utilizadas, criado_em,
        chamados (numero, cliente_id, impressoras (modelo, numero_serie)),
        tecnicos (nome)
      `)
      .not('pecas_utilizadas', 'is', null)
      .neq('pecas_utilizadas', '');

    if (inicio) query = query.gte('criado_em', inicio);
    if (fim) query = query.lte('criado_em', fim);
    if (tecnico_id) query = query.eq('tecnico_id', tecnico_id);

    const { data, error } = await query;
    if (error) throw error;

    // Buscar nomes dos clientes
    const clienteIds = [...new Set(data.map(r => r.chamados?.cliente_id).filter(Boolean))];
    let clientesMap = {};
    if (clienteIds.length > 0) {
      const { data: clientes } = await supabase
        .from('clientes')
        .select('id, nome')
        .in('id', clienteIds);
      clientes?.forEach(c => { clientesMap[c.id] = c.nome; });
    }

    let resultado = data.map(r => ({
      numero: r.chamados?.numero,
      cliente: clientesMap[r.chamados?.cliente_id] || '-',
      cliente_id: r.chamados?.cliente_id,
      tecnico: r.tecnicos?.nome || '-',
      impressora: r.chamados?.impressoras?.modelo || '-',
      numero_serie: r.chamados?.impressoras?.numero_serie || '-',
      pecas_utilizadas: r.pecas_utilizadas,
      data: new Date(r.criado_em).toLocaleDateString('pt-BR'),
    }));

    // Filtrar por cliente se solicitado
    if (cliente_id) {
      resultado = resultado.filter(r => r.cliente_id === cliente_id);
    }

    if (formato === 'xlsx') {
      const buffer = await gerarRelatorioPecasExcel(resultado);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=relatorio-pecas.xlsx');
      return res.send(Buffer.from(buffer));
    }

    if (formato === 'pdf') {
      const colunas = [
        { header: '#', key: 'numero', width: 50 },
        { header: 'Cliente', key: 'cliente', width: 110 },
        { header: 'Técnico', key: 'tecnico', width: 90 },
        { header: 'Impressora', key: 'impressora', width: 100 },
        { header: 'Peças', key: 'pecas_utilizadas', width: 180 },
        { header: 'Data', key: 'data', width: 70 },
      ];
      const pdfBuffer = await gerarRelatorioAgregadoPDF('Relatório de Peças Utilizadas', null, colunas, resultado);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=relatorio-pecas.pdf');
      return res.send(pdfBuffer);
    }

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar relatório de peças' });
  }
};
