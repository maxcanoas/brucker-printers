const supabase = require('./supabase');
const { gerarRelatorioPDF, gerarRelatorioHistoricoPDF } = require('./pdf');
const { enriquecerSla } = require('./businessHours');

// PDF do relatório de atendimento (por chamado). Usado no encerramento.
// Retorna null se não houver relatorios_atendimento para o chamado.
async function gerarPdfAtendimentoPorChamado(chamadoId) {
  const { data: relatorio } = await supabase
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
    .eq('chamado_id', chamadoId)
    .maybeSingle();

  if (!relatorio) return null;

  const ch = relatorio.chamados || {};
  const avaliacoes = ch.avaliacoes;
  const avaliacao = Array.isArray(avaliacoes) ? avaliacoes[0] : avaliacoes || null;

  return gerarRelatorioPDF({
    chamado: ch,
    relatorio,
    cliente: ch.clientes,
    tecnico: relatorio.tecnicos,
    impressora: ch.impressoras,
    atualizacoes: ch.chamado_atualizacoes || [],
    avaliacao,
    incluirAssinaturas: false,
  });
}

function montarResumo(chamados) {
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

  return resumo;
}

// PDF histórico filtrado para um único chamado. Usado no cancelamento
// (quando não há relatorios_atendimento para gerar o PDF de atendimento).
async function gerarPdfHistoricoPorChamado(numero) {
  if (!numero) return null;

  const { data: chamados } = await supabase
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
    .eq('numero', Number(numero));

  if (!chamados?.length) return null;

  chamados.forEach(c => {
    if (c.avaliacoes && !Array.isArray(c.avaliacoes)) {
      c.avaliacoes = [c.avaliacoes];
    }
  });

  await enriquecerSla(chamados);

  const resumo = montarResumo(chamados);
  const filtros = { numero: String(numero) };

  return gerarRelatorioHistoricoPDF(filtros, resumo, chamados);
}

module.exports = {
  gerarPdfAtendimentoPorChamado,
  gerarPdfHistoricoPorChamado,
};
