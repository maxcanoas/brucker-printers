const supabase = require('../services/supabase');
const { gerarRelatorioPDF } = require('../services/pdf');
const { gerarPdfAtendimentoPorChamado } = require('../services/chamadoPdf');
const { notificarRelatorioEmail } = require('../services/email');
const { notificarStatusPush } = require('../services/notifications');
const { notificarClienteConcluidoWhatsApp } = require('../services/whatsapp');

exports.criar = async (req, res) => {
  try {
    const { chamado_id, descricao_servico, pecas_utilizadas, duracao_minutos } = req.body;

    if (!chamado_id || !descricao_servico) {
      return res.status(400).json({ error: 'chamado_id e descricao_servico são obrigatórios' });
    }

    // Verificar se o chamado pertence ao técnico
    const { data: chamado } = await supabase
      .from('chamados')
      .select('id, tecnico_id, status')
      .eq('id', chamado_id)
      .single();

    if (!chamado) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }

    if (chamado.tecnico_id !== req.usuario.id) {
      return res.status(403).json({ error: 'Este chamado não está atribuído a você' });
    }

    if (chamado.status === 'concluido') {
      return res.status(400).json({ error: 'Chamado já está concluído' });
    }

    // Criar relatório
    const { data, error } = await supabase
      .from('relatorios_atendimento')
      .insert({
        chamado_id,
        tecnico_id: req.usuario.id,
        descricao_servico,
        pecas_utilizadas,
        duracao_minutos
      })
      .select()
      .single();

    if (error) throw error;

    // Concluir o chamado automaticamente
    await supabase
      .from('chamados')
      .update({ status: 'concluido' })
      .eq('id', chamado_id);

    // Registrar atualização
    await supabase.from('chamado_atualizacoes').insert({
      chamado_id,
      status_anterior: chamado.status,
      status_novo: 'concluido',
      observacao: 'Chamado encerrado com relatório de atendimento',
      usuario_tipo: 'tecnico'
    });

    // Buscar dados completos para notificações
    try {
      const { data: chamadoCompleto } = await supabase
        .from('chamados')
        .select('*, clientes(id, nome, email, telefone)')
        .eq('id', chamado_id)
        .single();

      if (chamadoCompleto?.clientes) {
        const pdfBuffer = await gerarPdfAtendimentoPorChamado(chamado_id).catch(err => {
          console.error('Erro ao gerar PDF de atendimento:', err);
          return null;
        });
        await Promise.all([
          notificarRelatorioEmail(chamadoCompleto.clientes, chamadoCompleto, pdfBuffer),
          notificarStatusPush(chamadoCompleto, 'concluido'),
          notificarClienteConcluidoWhatsApp(chamadoCompleto.clientes.telefone, chamadoCompleto),
        ]);
      }
    } catch (notifError) {
      console.error('Erro ao notificar sobre relatório:', notifError);
    }

    res.status(201).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar relatório' });
  }
};

exports.gerarPDF = async (req, res) => {
  try {
    const { data: relatorio, error } = await supabase
      .from('relatorios_atendimento')
      .select(`
        *,
        chamados (
          *,
          clientes (*),
          impressoras (*),
          chamado_atualizacoes (*),
          avaliacoes (*)
        ),
        tecnicos (nome, email)
      `)
      .eq('id', req.params.id)
      .single();

    if (error) return res.status(404).json({ error: 'Relatório não encontrado' });

    const ch = relatorio.chamados || {};
    const pdfBuffer = await gerarRelatorioPDF({
      chamado: ch,
      relatorio,
      cliente: ch.clientes,
      tecnico: relatorio.tecnicos,
      impressora: ch.impressoras,
      atualizacoes: ch.chamado_atualizacoes || [],
      avaliacao: (ch.avaliacoes && ch.avaliacoes[0]) || null,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition',
      `attachment; filename=relatorio-chamado-${relatorio.chamados.numero}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao gerar PDF' });
  }
};

exports.relatorioMensal = async (req, res) => {
  try {
    const { mes, ano } = req.query;
    const mesNum = parseInt(mes) || new Date().getMonth() + 1;
    const anoNum = parseInt(ano) || new Date().getFullYear();

    const inicio = new Date(anoNum, mesNum - 1, 1).toISOString();
    const fim = new Date(anoNum, mesNum, 0, 23, 59, 59).toISOString();

    const { data: chamados, error } = await supabase
      .from('chamados')
      .select(`
        *,
        clientes (nome),
        tecnicos (nome),
        relatorios_atendimento (duracao_minutos)
      `)
      .gte('criado_em', inicio)
      .lte('criado_em', fim);

    if (error) throw error;

    const resumo = {
      periodo: `${mesNum}/${anoNum}`,
      total_chamados: chamados.length,
      concluidos: chamados.filter(c => c.status === 'concluido').length,
      abertos: chamados.filter(c => c.status === 'aberto').length,
      tempo_medio_minutos: 0,
      dentro_sla: 0,
      fora_sla: 0,
      por_tipo: { preventivo: 0, corretivo: 0 },
      por_urgencia: { normal: 0, alta: 0, critica: 0 }
    };

    let totalDuracao = 0;
    let countDuracao = 0;

    chamados.forEach(c => {
      resumo.por_tipo[c.tipo]++;
      resumo.por_urgencia[c.urgencia]++;

      if (c.status === 'concluido' && c.sla_vence_em) {
        if (new Date(c.atualizado_em) <= new Date(c.sla_vence_em)) {
          resumo.dentro_sla++;
        } else {
          resumo.fora_sla++;
        }
      }

      if (c.relatorios_atendimento?.length > 0) {
        c.relatorios_atendimento.forEach(r => {
          if (r.duracao_minutos) {
            totalDuracao += r.duracao_minutos;
            countDuracao++;
          }
        });
      }
    });

    resumo.tempo_medio_minutos = countDuracao > 0 ? Math.round(totalDuracao / countDuracao) : 0;
    resumo.percentual_sla = resumo.concluidos > 0
      ? Math.round((resumo.dentro_sla / resumo.concluidos) * 100)
      : 100;

    res.json({ resumo, chamados });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar relatório mensal' });
  }
};
