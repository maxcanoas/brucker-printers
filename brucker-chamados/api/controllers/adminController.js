const supabase = require('../services/supabase');
const { enriquecerSla } = require('../services/businessHours');
const { gerarRelatorioHistoricoPDF } = require('../services/pdf');
const { gerarRelatorioHistoricoExcel } = require('../services/excel');

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
// RELATÓRIO ÚNICO: HISTÓRICO DE CHAMADOS
// ============================================
//
// Endpoint único que substitui os 5 relatórios agregados antigos. Aceita
// filtros opcionais e retorna a lista completa de chamados (com seu histórico
// de status, serviços, peças e avaliação) — pronto para ser exibido na aba ou
// exportado como documento de comprovação (PDF / Excel).
//
// Query params (todos opcionais):
//   inicio       — data ISO (filtra criado_em >= inicio)
//   fim          — data ISO (filtra criado_em <= fim)
//   cliente_id   — UUID
//   tecnico_id   — UUID
//   numero       — número sequencial do chamado (aceita "123" ou "#123")
//   status       — aberto | atribuido | em_atendimento | aguardando_peca | concluido | cancelado
//   tipo         — preventivo | corretivo
//   urgencia     — normal | alta | critica
//   formato      — pdf | xlsx (omitido = JSON)
// ============================================
exports.relatorioHistorico = async (req, res) => {
  try {
    const {
      inicio,
      fim,
      cliente_id,
      tecnico_id,
      numero,
      status,
      tipo,
      urgencia,
      formato,
    } = req.query;

    // Normaliza número do chamado: aceita "#123", "123", " 123 "
    const numeroLimpo = numero ? String(numero).replace(/[^\d]/g, '') : '';

    let query = supabase
      .from('chamados')
      .select(`
        *,
        clientes (id, nome, email, telefone),
        impressoras (modelo, numero_serie, tipo_contrato),
        tecnicos (id, nome, email),
        chamado_atualizacoes (id, status_anterior, status_novo, observacao, usuario_tipo, criado_em),
        relatorios_atendimento (id, descricao_servico, pecas_utilizadas, duracao_minutos, criado_em, tecnicos (nome)),
        avaliacoes (nota, comentario, criado_em)
      `)
      .order('criado_em', { ascending: false });

    if (inicio) query = query.gte('criado_em', inicio);
    if (fim) query = query.lte('criado_em', fim);
    if (cliente_id) query = query.eq('cliente_id', cliente_id);
    if (tecnico_id) query = query.eq('tecnico_id', tecnico_id);
    if (numeroLimpo) query = query.eq('numero', Number(numeroLimpo));
    if (status) query = query.eq('status', status);
    if (tipo) query = query.eq('tipo', tipo);
    if (urgencia) query = query.eq('urgencia', urgencia);

    const { data: chamados, error } = await query;
    if (error) throw error;

    // Normaliza avaliacoes: Supabase retorna objeto (não array) por causa do
    // UNIQUE(chamado_id). Envolver em array para compatibilidade com o resto do código.
    chamados.forEach(c => {
      if (c.avaliacoes && !Array.isArray(c.avaliacoes)) {
        c.avaliacoes = [c.avaliacoes];
      }
    });

    // Enriquece com SLA real (regras de horário comercial)
    await enriquecerSla(chamados);

    // ============ Resumo ============
    const resumo = {
      total: chamados.length,
      concluidos: 0,
      cancelados: 0,
      dentro_sla: 0,
      fora_sla: 0,
      por_status: {
        aberto: 0,
        atribuido: 0,
        em_atendimento: 0,
        aguardando_peca: 0,
        concluido: 0,
        cancelado: 0,
      },
      por_tipo: { preventivo: 0, corretivo: 0 },
      tempo_medio: 0,
      avaliacao_media: 0,
      percentual_sla: 0,
    };

    let totalDuracao = 0;
    let countDuracao = 0;
    let totalNota = 0;
    let countNota = 0;

    chamados.forEach(c => {
      if (c.status && resumo.por_status[c.status] !== undefined) {
        resumo.por_status[c.status]++;
      }
      if (c.tipo && resumo.por_tipo[c.tipo] !== undefined) {
        resumo.por_tipo[c.tipo]++;
      }
      if (c.status === 'concluido') {
        resumo.concluidos++;
        if (c.sla_vence_em && new Date(c.atualizado_em) <= new Date(c.sla_vence_em)) {
          resumo.dentro_sla++;
        } else {
          resumo.fora_sla++;
        }
      }
      if (c.status === 'cancelado') resumo.cancelados++;

      (c.relatorios_atendimento || []).forEach(r => {
        if (r.duracao_minutos) {
          totalDuracao += r.duracao_minutos;
          countDuracao++;
        }
      });

      const av = c.avaliacoes && c.avaliacoes[0];
      if (av && av.nota) {
        totalNota += av.nota;
        countNota++;
      }
    });

    resumo.tempo_medio = countDuracao > 0 ? Math.round(totalDuracao / countDuracao) : 0;
    resumo.avaliacao_media = countNota > 0 ? Math.round((totalNota / countNota) * 10) / 10 : 0;
    resumo.percentual_sla = resumo.concluidos > 0
      ? Math.round((resumo.dentro_sla / resumo.concluidos) * 100)
      : 100;

    // Filtros enriquecidos com nomes (para exibir nos exports)
    const filtros = {
      inicio,
      fim,
      cliente_id,
      tecnico_id,
      numero: numeroLimpo || undefined,
      status,
      tipo,
      urgencia,
    };
    if (cliente_id) {
      const cli = chamados.find(c => c.cliente_id === cliente_id)?.clientes;
      if (cli) filtros.cliente_nome = cli.nome;
    }
    if (tecnico_id) {
      const tec = chamados.find(c => c.tecnico_id === tecnico_id)?.tecnicos;
      if (tec) filtros.tecnico_nome = tec.nome;
    }

    // ============ Branching por formato ============
    if (formato === 'pdf') {
      const pdfBuffer = await gerarRelatorioHistoricoPDF(filtros, resumo, chamados);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=relatorio-historico.pdf');
      return res.send(pdfBuffer);
    }

    if (formato === 'xlsx') {
      const buffer = await gerarRelatorioHistoricoExcel(filtros, resumo, chamados);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=relatorio-historico.xlsx');
      return res.send(Buffer.from(buffer));
    }

    res.json({ filtros, resumo, chamados });
  } catch (error) {
    console.error('Erro ao gerar relatório de histórico:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório de histórico' });
  }
};
