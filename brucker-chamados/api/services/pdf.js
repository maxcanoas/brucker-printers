const PDFDocument = require('pdfkit');

// ============ Constantes visuais ============
const ORANGE = '#E84C1E';
const DARK = '#0D1117';
const GRAY = '#6B7280';
const TEXT_GRAY = '#374151';
const LIGHT_GRAY = '#F3F4F6';
const BORDER = '#E5E7EB';
const GREEN = '#10B981';
const RED = '#EF4444';
const MARGIN = 40;

const STATUS_COLORS = {
  aberto: '#8A94A6',
  atribuido: '#3B82F6',
  em_atendimento: '#E84C1E',
  aguardando_peca: '#F59E0B',
  concluido: '#10B981',
  cancelado: '#EF4444',
};

const USUARIO_LABEL = {
  cliente: 'Cliente',
  tecnico: 'Técnico',
  admin: 'Admin',
  sistema: 'Sistema',
};

const statusTexto = {
  aberto: 'Aberto',
  atribuido: 'Atribuído',
  em_atendimento: 'Em Atendimento',
  aguardando_peca: 'Aguardando Peça',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

// ============ Formatadores ============
function fmtDateTime(d) {
  if (!d) return '-';
  return new Date(d).toLocaleString('pt-BR');
}
function fmtData(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('pt-BR');
}
function fmtDuracao(min) {
  if (!min && min !== 0) return '-';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h > 0 ? h + 'h ' : ''}${m}min`;
}
function tituloUrgencia(u) {
  if (!u) return '-';
  return u.charAt(0).toUpperCase() + u.slice(1);
}

// ============ Renderer factory ============
// Cria um conjunto de helpers que compartilham estado (doc, callbacks de página).
// Permite reusar a mesma lógica de layout tanto no PDF individual quanto no
// PDF histórico (multi-chamado).
function criarRenderer(doc) {
  const PAGE_W = doc.page.width;
  const PAGE_H = doc.page.height;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  let onNovaPagina = null;

  function setOnNovaPagina(fn) {
    onNovaPagina = fn;
  }

  function ensureSpace(needed) {
    if (doc.y + needed > PAGE_H - 60) {
      doc.addPage();
      if (onNovaPagina) onNovaPagina(doc);
    }
  }

  function desenharCard(title, linhas, x, y, w) {
    const padding = 10;
    const lineH = 14;
    const headerH = 20;
    const bodyH = padding + linhas.length * lineH + padding - 4;
    const h = headerH + bodyH;

    doc.rect(x, y, w, headerH).fill(LIGHT_GRAY);
    doc.lineWidth(1).strokeColor(BORDER).rect(x, y, w, h).stroke();
    doc.fillColor(DARK).font('Helvetica-Bold').fontSize(9)
      .text(title.toUpperCase(), x + padding, y + 6);

    let cy = y + headerH + 6;
    linhas.forEach(([l, v]) => {
      doc.font('Helvetica-Bold').fontSize(9).fillColor(GRAY)
        .text(`${l}: `, x + padding, cy, { continued: true, width: w - padding * 2 });
      doc.font('Helvetica').fillColor(DARK).text(v || '-');
      cy += lineH;
    });
    return h;
  }

  function desenharSecaoTitulo(titulo) {
    ensureSpace(28);
    doc.font('Helvetica-Bold').fontSize(11).fillColor(ORANGE)
      .text(titulo.toUpperCase(), MARGIN, doc.y);
    const ly = doc.y + 2;
    doc.lineWidth(1).strokeColor(ORANGE)
      .moveTo(MARGIN, ly).lineTo(MARGIN + CONTENT_W, ly).stroke();
    doc.y = ly + 6;
    doc.fillColor(DARK);
  }

  function desenharBlocoTexto(texto) {
    const x = MARGIN;
    const w = CONTENT_W;
    const padding = 10;
    const conteudo = (texto && String(texto).trim()) || '-';
    doc.font('Helvetica').fontSize(10);
    const textH = doc.heightOfString(conteudo, { width: w - padding * 2 });
    const h = textH + padding * 2;
    ensureSpace(h + 10);
    const y = doc.y;
    doc.rect(x, y, w, h).fill(LIGHT_GRAY);
    doc.fillColor(DARK).font('Helvetica').fontSize(10)
      .text(conteudo, x + padding, y + padding, { width: w - padding * 2 });
    doc.y = y + h + 12;
  }

  function desenharEvento(ev, isLast) {
    ensureSpace(46);
    const cx = MARGIN + 10;
    const yStart = doc.y;
    const cor = STATUS_COLORS[ev.status_novo] || GRAY;
    const label = (statusTexto[ev.status_novo] || ev.status_novo || '').toUpperCase();
    const autor = USUARIO_LABEL[ev.usuario_tipo] || ev.usuario_tipo || '';

    const tx = cx + 14;
    const tw = CONTENT_W - 24;

    doc.font('Helvetica-Bold').fontSize(9).fillColor(DARK)
      .text(fmtDateTime(ev.criado_em), tx, yStart, { width: tw, continued: true });
    doc.font('Helvetica').fillColor(GRAY).text('   •   ', { continued: true });
    doc.font('Helvetica-Bold').fillColor(cor).text(label, { continued: true });
    doc.font('Helvetica').fillColor(GRAY).text(autor ? `   (${autor})` : '');

    if (ev.observacao) {
      doc.font('Helvetica').fontSize(9).fillColor(TEXT_GRAY)
        .text(ev.observacao, tx, doc.y + 1, { width: tw });
    }
    const yEnd = doc.y + 6;

    doc.circle(cx, yStart + 5, 4).fill(cor);
    if (!isLast) {
      doc.lineWidth(1).strokeColor(BORDER)
        .moveTo(cx, yStart + 11).lineTo(cx, yEnd + 6).stroke();
    }

    doc.fillColor(DARK);
    doc.y = yEnd + 4;
  }

  // Renderiza um chamado completo (cards, problema, timeline, serviço, peças,
  // avaliação e — opcionalmente — assinaturas). Pressupõe que o cabeçalho da
  // página já foi desenhado pelo chamador.
  function desenharSecaoChamado(dados, opcoes = {}) {
    const {
      chamado = {},
      cliente,
      tecnico,
      impressora,
      atualizacoes = [],
      relatorio,
      avaliacao,
    } = dados;
    const incluirAssinaturas = opcoes.incluirAssinaturas !== false;

    // Cards Cliente / Equipamento
    const cardW = (CONTENT_W - 12) / 2;
    const cardY = doc.y;
    const linhasCliente = [
      ['Nome', cliente?.nome],
      ['Telefone', cliente?.telefone],
      ['Email', cliente?.email],
    ];
    const linhasEquip = [
      ['Modelo', impressora?.modelo],
      ['N° Série', impressora?.numero_serie],
      ['Contrato', impressora?.tipo_contrato === 'locacao' ? 'Locação' : (impressora?.tipo_contrato || '-')],
    ];
    const h1 = desenharCard('Cliente', linhasCliente, MARGIN, cardY, cardW);
    const h2 = desenharCard('Equipamento', linhasEquip, MARGIN + cardW + 12, cardY, cardW);
    doc.y = cardY + Math.max(h1, h2) + 12;

    // Bloco Atendimento (full width)
    const atY = doc.y;
    const atLinhas = [
      ['Tipo', chamado.tipo === 'preventivo' ? 'Preventivo' : 'Corretivo'],
      ['Urgência', tituloUrgencia(chamado.urgencia)],
      ['Aberto em', fmtDateTime(chamado.criado_em)],
      ['Concluído em', fmtDateTime(relatorio?.criado_em || (chamado.status === 'concluido' ? chamado.atualizado_em : null))],
      ['Técnico responsável', tecnico?.nome || '-'],
    ];
    desenharCard('Atendimento', atLinhas, MARGIN, atY, CONTENT_W);
    doc.y = atY + 20 + 10 + atLinhas.length * 14 + 10 - 4 + 12;

    // Problema relatado
    desenharSecaoTitulo('Problema relatado');
    desenharBlocoTexto(chamado.descricao);

    // Histórico do atendimento (timeline)
    desenharSecaoTitulo('Histórico do atendimento');
    const eventos = [...(atualizacoes || [])].sort(
      (a, b) => new Date(a.criado_em) - new Date(b.criado_em)
    );
    if (eventos.length === 0) {
      doc.font('Helvetica-Oblique').fontSize(9).fillColor(GRAY)
        .text('Nenhum evento registrado.', MARGIN, doc.y);
      doc.y += 12;
      doc.fillColor(DARK);
    } else {
      eventos.forEach((ev, i) => desenharEvento(ev, i === eventos.length - 1));
    }
    doc.y += 6;

    // Serviço Realizado
    desenharSecaoTitulo('Serviço realizado');
    desenharBlocoTexto(relatorio?.descricao_servico);

    // Peças utilizadas
    if (relatorio?.pecas_utilizadas && String(relatorio.pecas_utilizadas).trim()) {
      desenharSecaoTitulo('Peças utilizadas');
      const itens = String(relatorio.pecas_utilizadas)
        .split(/\n|,|;/)
        .map(s => s.trim())
        .filter(Boolean);
      const padding = 10;
      const lineH = 14;
      const h = padding * 2 + Math.max(1, itens.length) * lineH;
      ensureSpace(h + 10);
      const y = doc.y;
      doc.rect(MARGIN, y, CONTENT_W, h).fill(LIGHT_GRAY);
      doc.fillColor(DARK).font('Helvetica').fontSize(10);
      let cy = y + padding;
      (itens.length ? itens : ['-']).forEach(item => {
        doc.text(`•  ${item}`, MARGIN + padding, cy, { width: CONTENT_W - padding * 2 });
        cy += lineH;
      });
      doc.y = y + h + 12;
    }

    // Duração
    if (relatorio?.duracao_minutos) {
      ensureSpace(24);
      doc.font('Helvetica-Bold').fontSize(10).fillColor(DARK)
        .text('Duração de execução: ', MARGIN, doc.y, { continued: true });
      doc.font('Helvetica').text(fmtDuracao(relatorio.duracao_minutos));
      doc.y += 8;
    }

    // Avaliação do cliente
    if (avaliacao) {
      desenharSecaoTitulo('Avaliação do cliente');
      const padding = 10;
      const nota = avaliacao.nota || 0;
      const stars = `${nota} / 5`;
      const com = (avaliacao.comentario || '').trim();
      doc.font('Helvetica-Oblique').fontSize(10);
      const comH = com ? doc.heightOfString(`"${com}"`, { width: CONTENT_W - padding * 2 }) : 0;
      const h = padding * 2 + 18 + (com ? comH + 4 : 0);
      ensureSpace(h + 10);
      const y = doc.y;
      doc.rect(MARGIN, y, CONTENT_W, h).fill(LIGHT_GRAY);
      doc.fillColor(ORANGE).font('Helvetica-Bold').fontSize(14)
        .text(stars, MARGIN + padding, y + padding);
      if (com) {
        doc.font('Helvetica-Oblique').fontSize(10).fillColor(TEXT_GRAY)
          .text(`"${com}"`, MARGIN + padding, y + padding + 18, { width: CONTENT_W - padding * 2 });
      }
      doc.fillColor(DARK);
      doc.y = y + h + 12;
    }

    // Assinaturas
    if (incluirAssinaturas) {
      ensureSpace(80);
      doc.y += 16;
      const sigY = doc.y;
      const sigW = (CONTENT_W - 40) / 2;
      doc.lineWidth(1).strokeColor(DARK)
        .moveTo(MARGIN, sigY).lineTo(MARGIN + sigW, sigY).stroke();
      doc.font('Helvetica-Bold').fontSize(9).fillColor(DARK)
        .text('Técnico Responsável', MARGIN, sigY + 4);
      doc.font('Helvetica').fontSize(9).fillColor(GRAY)
        .text(tecnico?.nome || '', MARGIN, sigY + 16);

      const cxSig = MARGIN + sigW + 40;
      doc.lineWidth(1).strokeColor(DARK)
        .moveTo(cxSig, sigY).lineTo(cxSig + sigW, sigY).stroke();
      doc.font('Helvetica-Bold').fontSize(9).fillColor(DARK)
        .text('Cliente / Recebedor', cxSig, sigY + 4);
      doc.font('Helvetica').fontSize(9).fillColor(GRAY)
        .text('Nome: ____________________________', cxSig, sigY + 16);
      doc.text('Data: ____/____/______', cxSig, sigY + 28);
    }
  }

  return {
    PAGE_W,
    PAGE_H,
    CONTENT_W,
    setOnNovaPagina,
    ensureSpace,
    desenharCard,
    desenharSecaoTitulo,
    desenharBlocoTexto,
    desenharEvento,
    desenharSecaoChamado,
  };
}

// ============ Cabeçalhos ============
function desenharCabecalhoPrincipal(doc, chamado) {
  const PAGE_W = doc.page.width;
  const CONTENT_W = PAGE_W - MARGIN * 2;
  doc.rect(0, 0, PAGE_W, 70).fill(ORANGE);
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(20)
    .text('BRUCKER PRINTERS', MARGIN, 18);
  doc.font('Helvetica').fontSize(11)
    .text('Relatório de Atendimento Técnico', MARGIN, 44);
  doc.font('Helvetica-Bold').fontSize(16).fillColor('#FFFFFF')
    .text(`Chamado #${chamado?.numero || '----'}`, MARGIN, 18, { align: 'right', width: CONTENT_W });
  doc.font('Helvetica').fontSize(9)
    .text(`Emitido: ${fmtDateTime(new Date())}`, MARGIN, 44, { align: 'right', width: CONTENT_W });
  doc.fillColor(DARK);
  doc.y = 90;
}

function desenharCabecalhoCompacto(doc, texto) {
  const PAGE_W = doc.page.width;
  doc.rect(0, 0, PAGE_W, 30).fill(ORANGE);
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(11)
    .text(texto, MARGIN, 9);
  doc.fillColor(DARK);
  doc.y = 50;
}

function desenharRodape(doc) {
  const PAGE_W = doc.page.width;
  const PAGE_H = doc.page.height;
  const CONTENT_W = PAGE_W - MARGIN * 2;
  const footerY = PAGE_H - 30;

  // Salva o cursor para que o footer não polua o fluxo do conteúdo.
  const yAntes = doc.y;
  doc.lineWidth(0.5).strokeColor(BORDER)
    .moveTo(MARGIN, footerY - 8).lineTo(MARGIN + CONTENT_W, footerY - 8).stroke();
  // height: 12 limita a região onde o LineWrapper tenta encaixar o texto, evitando
  // que o PDFKit dispare continueOnNewPage() quando y > PAGE_H - bottomMargin.
  doc.font('Helvetica').fontSize(8).fillColor(GRAY)
    .text(
      `Brucker Printers · Documento gerado em ${fmtDateTime(new Date())}`,
      MARGIN, footerY - 2,
      { width: CONTENT_W, align: 'center', height: 12 }
    );
  doc.y = yAntes;
}

// ============ PDF individual (chamado único) ============
function gerarRelatorioPDF({ chamado, relatorio, cliente, tecnico, impressora, atualizacoes = [], avaliacao = null }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: MARGIN, size: 'A4' });
      const chunks = [];
      doc.on('data', c => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      const renderer = criarRenderer(doc);
      renderer.setOnNovaPagina((d) => {
        desenharCabecalhoCompacto(d, `BRUCKER PRINTERS  —  Chamado #${chamado?.numero || ''}  —  Continuação`);
      });

      desenharCabecalhoPrincipal(doc, chamado);
      renderer.desenharSecaoChamado(
        { chamado, cliente, tecnico, impressora, atualizacoes, relatorio, avaliacao },
        { incluirAssinaturas: true }
      );
      desenharRodape(doc);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// ============ PDF histórico (multi-chamado) ============
function gerarRelatorioHistoricoPDF(filtros = {}, resumo = {}, chamados = []) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: MARGIN, size: 'A4', bufferPages: true });
      const chunks = [];
      doc.on('data', c => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      const renderer = criarRenderer(doc);
      const PAGE_W = doc.page.width;
      const PAGE_H = doc.page.height;
      const CONTENT_W = PAGE_W - MARGIN * 2;

      // ============ CAPA ============
      // Cabeçalho da capa
      doc.rect(0, 0, PAGE_W, 90).fill(ORANGE);
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(22)
        .text('BRUCKER PRINTERS', MARGIN, 22);
      doc.font('Helvetica').fontSize(12)
        .text('Relatório de Histórico de Atendimentos', MARGIN, 50);
      doc.font('Helvetica').fontSize(9)
        .text(`Emitido em ${fmtDateTime(new Date())}`, MARGIN, 68);
      doc.fillColor(DARK);
      doc.y = 110;

      // Bloco de filtros aplicados
      const linhasFiltros = [];
      if (filtros.numero) linhasFiltros.push(['Chamado', `#${filtros.numero}`]);
      if (filtros.cliente_nome) linhasFiltros.push(['Cliente', filtros.cliente_nome]);
      if (filtros.tecnico_nome) linhasFiltros.push(['Técnico', filtros.tecnico_nome]);
      if (filtros.inicio || filtros.fim) {
        linhasFiltros.push([
          'Período',
          `${filtros.inicio ? fmtData(filtros.inicio) : '...'} a ${filtros.fim ? fmtData(filtros.fim) : '...'}`,
        ]);
      }
      if (filtros.status) linhasFiltros.push(['Status', statusTexto[filtros.status] || filtros.status]);
      if (filtros.tipo) linhasFiltros.push(['Tipo', filtros.tipo === 'preventivo' ? 'Preventivo' : 'Corretivo']);
      if (filtros.urgencia) linhasFiltros.push(['Urgência', tituloUrgencia(filtros.urgencia)]);
      if (linhasFiltros.length === 0) linhasFiltros.push(['Filtros', 'Todos os chamados']);

      renderer.desenharCard('Filtros aplicados', linhasFiltros, MARGIN, doc.y, CONTENT_W);
      doc.y += 20 + 10 + linhasFiltros.length * 14 + 10 - 4 + 16;

      // Cards de resumo (grid 4 por linha)
      renderer.desenharSecaoTitulo('Resumo geral');

      const cards = [
        { label: 'Total de Chamados', valor: String(resumo.total ?? 0) },
        { label: 'Concluídos', valor: String(resumo.concluidos ?? 0) },
        { label: 'Dentro do SLA', valor: String(resumo.dentro_sla ?? 0), cor: GREEN },
        { label: 'Fora do SLA', valor: String(resumo.fora_sla ?? 0), cor: RED },
        { label: '% SLA Cumprido', valor: `${resumo.percentual_sla ?? 0}%` },
        { label: 'Tempo Médio', valor: resumo.tempo_medio ? `${resumo.tempo_medio} min` : '-' },
        { label: 'Avaliação Média', valor: resumo.avaliacao_media ? `${resumo.avaliacao_media} / 5` : '-' },
        { label: 'Cancelados', valor: String(resumo.cancelados ?? 0) },
      ];
      const colCards = 4;
      const cardGap = 10;
      const cardCardW = (CONTENT_W - cardGap * (colCards - 1)) / colCards;
      const cardCardH = 50;
      let cx = MARGIN;
      let cyStart = doc.y;
      cards.forEach((card, i) => {
        const col = i % colCards;
        const row = Math.floor(i / colCards);
        cx = MARGIN + col * (cardCardW + cardGap);
        const cy = cyStart + row * (cardCardH + cardGap);
        doc.rect(cx, cy, cardCardW, cardCardH).fill(LIGHT_GRAY);
        doc.lineWidth(0.5).strokeColor(BORDER).rect(cx, cy, cardCardW, cardCardH).stroke();
        doc.font('Helvetica').fontSize(8).fillColor(GRAY)
          .text(card.label.toUpperCase(), cx + 8, cy + 8, { width: cardCardW - 16 });
        doc.font('Helvetica-Bold').fontSize(16).fillColor(card.cor || DARK)
          .text(card.valor, cx + 8, cy + 22, { width: cardCardW - 16 });
      });
      doc.fillColor(DARK);
      const linhasCards = Math.ceil(cards.length / colCards);
      doc.y = cyStart + linhasCards * (cardCardH + cardGap) + 8;

      // Distribuição por status
      const porStatus = resumo.por_status || {};
      if (Object.keys(porStatus).length > 0) {
        renderer.desenharSecaoTitulo('Distribuição por status');
        const linhasStatus = Object.entries(porStatus)
          .filter(([, qtd]) => qtd > 0)
          .map(([st, qtd]) => [statusTexto[st] || st, String(qtd)]);
        if (linhasStatus.length > 0) {
          renderer.desenharCard('Por Status', linhasStatus, MARGIN, doc.y, CONTENT_W);
          doc.y += 20 + 10 + linhasStatus.length * 14 + 10 - 4 + 12;
        }
      }

      desenharRodape(doc);

      // ============ Uma página por chamado ============
      chamados.forEach((c) => {
        doc.addPage();
        // O cabeçalho compacto é desenhado aqui (página inicial do chamado)
        desenharCabecalhoCompacto(doc, `BRUCKER PRINTERS  —  Chamado #${c.numero || ''}  —  ${c.clientes?.nome || ''}`);
        // E também em qualquer continuação que ensureSpace disparar
        renderer.setOnNovaPagina((d) => {
          desenharCabecalhoCompacto(d, `BRUCKER PRINTERS  —  Chamado #${c.numero || ''}  —  Continuação`);
        });

        renderer.desenharSecaoChamado(
          {
            chamado: c,
            cliente: c.clientes,
            tecnico: c.tecnicos,
            impressora: c.impressoras,
            atualizacoes: c.chamado_atualizacoes || [],
            relatorio: (c.relatorios_atendimento && c.relatorios_atendimento[0]) || null,
            avaliacao: (c.avaliacoes && c.avaliacoes[0]) || null,
          },
          { incluirAssinaturas: false }
        );

        desenharRodape(doc);
      });

      // Numeração de páginas (precisa ser feito ao final, varrendo todas as páginas).
      // height: 12 evita que o LineWrapper acione continueOnNewPage() quando o
      // texto é desenhado abaixo da margem inferior do documento.
      const range = doc.bufferedPageRange ? doc.bufferedPageRange() : null;
      if (range) {
        for (let i = range.start; i < range.start + range.count; i++) {
          doc.switchToPage(i);
          const PAGE_W2 = doc.page.width;
          const PAGE_H2 = doc.page.height;
          doc.font('Helvetica').fontSize(8).fillColor(GRAY)
            .text(
              `Página ${i + 1} de ${range.count}`,
              MARGIN, PAGE_H2 - 22,
              { width: PAGE_W2 - MARGIN * 2, align: 'right', height: 12 }
            );
        }
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  gerarRelatorioPDF,
  gerarRelatorioHistoricoPDF,
  statusTexto,
};
