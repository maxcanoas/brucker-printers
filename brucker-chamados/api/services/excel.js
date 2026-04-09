const ExcelJS = require('exceljs');

const BRAND = {
  primary: 'FF0D1117',
  primarySoft: 'FF1F2937',
  accent: 'FF1E40AF',
  muted: 'FFE5E7EB',
  mutedSoft: 'FFF3F4F6',
  zebra: 'FFF9FAFB',
};

const STATUS_COLORS = {
  aberto:          { bg: 'FFFEF3C7', fg: 'FF92400E' },
  atribuido:       { bg: 'FFE0E7FF', fg: 'FF3730A3' },
  em_atendimento:  { bg: 'FFDBEAFE', fg: 'FF1E40AF' },
  aguardando_peca: { bg: 'FFFEF3C7', fg: 'FF92400E' },
  concluido:       { bg: 'FFD1FAE5', fg: 'FF047857' },
  cancelado:       { bg: 'FFFEE2E2', fg: 'FF991B1B' },
};

const URGENCIA_COLORS = {
  normal:  { bg: 'FFF3F4F6', fg: 'FF374151' },
  alta:    { bg: 'FFFED7AA', fg: 'FF9A3412' },
  critica: { bg: 'FFFECACA', fg: 'FF991B1B' },
};

const SLA_COLORS = {
  Cumprido:  { bg: 'FFD1FAE5', fg: 'FF047857' },
  Estourado: { bg: 'FFFEE2E2', fg: 'FF991B1B' },
  '-':       { bg: 'FFF3F4F6', fg: 'FF6B7280' },
};

const KPI_PALETTE = {
  total:     'FF1E40AF',
  concluido: 'FF047857',
  dentroSla: 'FF10B981',
  foraSla:   'FFDC2626',
  tempo:     'FF374151',
  nota:      'FFD97706',
};

const headerStyle = {
  font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D1117' } },
  alignment: { horizontal: 'center', vertical: 'middle' },
  border: {
    top: { style: 'thin' },
    bottom: { style: 'thin' },
    left: { style: 'thin' },
    right: { style: 'thin' },
  }
};

const cellBorder = {
  top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
  bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
  left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
  right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
};

const statusTexto = {
  aberto: 'Aberto',
  atribuido: 'Atribuído',
  em_atendimento: 'Em Atendimento',
  aguardando_peca: 'Aguardando Peça',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

function aplicarEstiloHeader(row) {
  row.eachCell(cell => {
    cell.style = headerStyle;
  });
  row.height = 25;
}

function aplicarEstiloCelulas(sheet, startRow) {
  for (let i = startRow; i <= sheet.rowCount; i++) {
    const row = sheet.getRow(i);
    row.eachCell(cell => {
      cell.border = cellBorder;
      cell.alignment = { vertical: 'middle', wrapText: true };
    });
    if (i % 2 === 0) {
      row.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
      });
    }
  }
}

async function gerarRelatorioPeriodoExcel(resumo, chamados) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Brucker Printers';

  // Aba Resumo
  const wsResumo = workbook.addWorksheet('Resumo');
  wsResumo.columns = [
    { header: 'Métrica', key: 'metrica', width: 30 },
    { header: 'Valor', key: 'valor', width: 20 },
  ];
  aplicarEstiloHeader(wsResumo.getRow(1));

  const metricas = [
    ['Total de Chamados', resumo.total],
    ['Concluídos', resumo.concluidos],
    ['Abertos', resumo.abertos],
    ['Em Atendimento', resumo.em_atendimento],
    ['Dentro do SLA', resumo.dentro_sla],
    ['Fora do SLA', resumo.fora_sla],
    ['% SLA Cumprido', `${resumo.percentual_sla}%`],
    ['Tempo Médio (min)', resumo.tempo_medio],
    ['Preventivos', resumo.por_tipo?.preventivo || 0],
    ['Corretivos', resumo.por_tipo?.corretivo || 0],
  ];
  metricas.forEach(([m, v]) => wsResumo.addRow({ metrica: m, valor: v }));
  aplicarEstiloCelulas(wsResumo, 2);

  // Aba Chamados
  const wsChamados = workbook.addWorksheet('Chamados');
  wsChamados.columns = [
    { header: '#', key: 'numero', width: 10 },
    { header: 'Status', key: 'status', width: 18 },
    { header: 'Tipo', key: 'tipo', width: 14 },
    { header: 'Urgência', key: 'urgencia', width: 12 },
    { header: 'Cliente', key: 'cliente', width: 25 },
    { header: 'Técnico', key: 'tecnico', width: 20 },
    { header: 'Descrição', key: 'descricao', width: 40 },
    { header: 'Criado em', key: 'criado_em', width: 20 },
    { header: 'SLA', key: 'sla_status', width: 15 },
  ];
  aplicarEstiloHeader(wsChamados.getRow(1));

  chamados.forEach(c => {
    let slaStatus = '-';
    if (c.status === 'concluido' && c.sla_vence_em) {
      slaStatus = new Date(c.atualizado_em) <= new Date(c.sla_vence_em) ? 'Cumprido' : 'Estourado';
    }
    wsChamados.addRow({
      numero: c.numero,
      status: statusTexto[c.status] || c.status,
      tipo: c.tipo === 'preventivo' ? 'Preventivo' : 'Corretivo',
      urgencia: c.urgencia?.charAt(0).toUpperCase() + c.urgencia?.slice(1),
      cliente: c.clientes?.nome || '-',
      tecnico: c.tecnicos?.nome || '-',
      descricao: (c.descricao || '').substring(0, 100),
      criado_em: new Date(c.criado_em).toLocaleString('pt-BR'),
      sla_status: slaStatus,
    });
  });
  aplicarEstiloCelulas(wsChamados, 2);

  return workbook.xlsx.writeBuffer();
}

async function gerarRelatorioClientesExcel(dados) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Brucker Printers';

  const ws = workbook.addWorksheet('Por Cliente');
  ws.columns = [
    { header: 'Cliente', key: 'cliente', width: 30 },
    { header: 'Total', key: 'total', width: 10 },
    { header: 'Abertos', key: 'abertos', width: 12 },
    { header: 'Concluídos', key: 'concluidos', width: 14 },
    { header: 'Dentro SLA', key: 'dentro_sla', width: 14 },
    { header: 'Fora SLA', key: 'fora_sla', width: 12 },
    { header: '% SLA', key: 'percentual_sla', width: 10 },
  ];
  aplicarEstiloHeader(ws.getRow(1));

  dados.forEach(d => {
    ws.addRow({
      ...d,
      percentual_sla: d.concluidos > 0 ? `${Math.round((d.dentro_sla / d.concluidos) * 100)}%` : '100%',
    });
  });
  aplicarEstiloCelulas(ws, 2);

  return workbook.xlsx.writeBuffer();
}

async function gerarRelatorioTecnicosExcel(dados) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Brucker Printers';

  const ws = workbook.addWorksheet('Por Técnico');
  ws.columns = [
    { header: 'Técnico', key: 'tecnico', width: 25 },
    { header: 'Total', key: 'total', width: 10 },
    { header: 'Concluídos', key: 'concluidos', width: 14 },
    { header: 'Dentro SLA', key: 'dentro_sla', width: 14 },
    { header: '% SLA', key: 'percentual_sla', width: 10 },
    { header: 'Tempo Médio (min)', key: 'tempo_medio', width: 18 },
  ];
  aplicarEstiloHeader(ws.getRow(1));

  dados.forEach(d => {
    ws.addRow({
      ...d,
      percentual_sla: `${d.percentual_sla}%`,
    });
  });
  aplicarEstiloCelulas(ws, 2);

  return workbook.xlsx.writeBuffer();
}

async function gerarRelatorioSlaExcel(dados) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Brucker Printers';

  // Aba Resumo
  const wsResumo = workbook.addWorksheet('Resumo SLA');
  wsResumo.columns = [
    { header: 'Métrica', key: 'metrica', width: 30 },
    { header: 'Valor', key: 'valor', width: 20 },
  ];
  aplicarEstiloHeader(wsResumo.getRow(1));
  [
    ['Total Concluídos', dados.resumo.total_concluidos],
    ['Dentro do SLA', dados.resumo.dentro_sla],
    ['Fora do SLA', dados.resumo.fora_sla],
    ['% Cumprimento', `${dados.resumo.percentual_sla}%`],
  ].forEach(([m, v]) => wsResumo.addRow({ metrica: m, valor: v }));
  aplicarEstiloCelulas(wsResumo, 2);

  // Aba Detalhes
  const ws = workbook.addWorksheet('Detalhes SLA');
  ws.columns = [
    { header: '#', key: 'numero', width: 10 },
    { header: 'Cliente', key: 'cliente', width: 25 },
    { header: 'Técnico', key: 'tecnico', width: 20 },
    { header: 'Urgência', key: 'urgencia', width: 12 },
    { header: 'SLA Status', key: 'sla_status', width: 14 },
    { header: 'Criado em', key: 'criado_em', width: 20 },
    { header: 'Concluído em', key: 'concluido_em', width: 20 },
  ];
  aplicarEstiloHeader(ws.getRow(1));

  dados.chamados.forEach(c => {
    ws.addRow({
      numero: c.numero,
      cliente: c.clientes?.nome || '-',
      tecnico: c.tecnicos?.nome || '-',
      urgencia: c.urgencia,
      sla_status: c.sla_cumprido ? 'Cumprido' : 'Estourado',
      criado_em: new Date(c.criado_em).toLocaleString('pt-BR'),
      concluido_em: new Date(c.atualizado_em).toLocaleString('pt-BR'),
    });
  });
  aplicarEstiloCelulas(ws, 2);

  return workbook.xlsx.writeBuffer();
}

async function gerarRelatorioPecasExcel(dados) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Brucker Printers';

  const ws = workbook.addWorksheet('Peças Utilizadas');
  ws.columns = [
    { header: 'Chamado #', key: 'numero', width: 12 },
    { header: 'Cliente', key: 'cliente', width: 25 },
    { header: 'Técnico', key: 'tecnico', width: 20 },
    { header: 'Impressora', key: 'impressora', width: 20 },
    { header: 'Peças Utilizadas', key: 'pecas', width: 40 },
    { header: 'Data', key: 'data', width: 20 },
  ];
  aplicarEstiloHeader(ws.getRow(1));

  dados.forEach(d => {
    ws.addRow({
      numero: d.numero,
      cliente: d.cliente,
      tecnico: d.tecnico,
      impressora: d.impressora,
      pecas: d.pecas_utilizadas,
      data: d.data,
    });
  });
  aplicarEstiloCelulas(ws, 2);

  return workbook.xlsx.writeBuffer();
}

// ============================================================
// Helpers de formatação profissional (usados pelo histórico)
// ============================================================

function capitalizar(s) {
  if (!s) return '-';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function pintarBadge(cell, palette, bold = false) {
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: palette.bg } };
  cell.font = { color: { argb: palette.fg }, bold, size: 10 };
  cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: false };
  cell.border = {
    top:    { style: 'thin', color: { argb: BRAND.muted } },
    bottom: { style: 'thin', color: { argb: BRAND.muted } },
    left:   { style: 'thin', color: { argb: BRAND.muted } },
    right:  { style: 'thin', color: { argb: BRAND.muted } },
  };
}

function escreverTituloInstitucional(ws, titulo, ncols) {
  const last = String.fromCharCode(64 + ncols);

  ws.mergeCells(`A1:${last}1`);
  const t = ws.getCell('A1');
  t.value = titulo;
  t.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 16 };
  t.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.primary } };
  t.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 32;

  ws.mergeCells(`A2:${last}2`);
  const sub = ws.getCell('A2');
  sub.value = `Gerado em ${new Date().toLocaleString('pt-BR')}`;
  sub.font = { italic: true, color: { argb: 'FFFFFFFF' }, size: 10 };
  sub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.primarySoft } };
  sub.alignment = { horizontal: 'right', vertical: 'middle' };
  ws.getRow(2).height = 18;

  ws.getRow(3).height = 6;
}

function escreverBlocoFiltros(ws, filtros, ncols, startRow) {
  const last = String.fromCharCode(64 + ncols);
  const STATUS_LABEL = {
    aberto: 'Aberto', atribuido: 'Atribuído', em_atendimento: 'Em Atendimento',
    aguardando_peca: 'Aguardando Peça', concluido: 'Concluído', cancelado: 'Cancelado',
  };
  const fmtData = (iso) => {
    if (!iso) return null;
    try { return new Date(iso).toLocaleDateString('pt-BR'); } catch { return iso; }
  };

  const ativos = [];
  if (filtros.inicio || filtros.fim) {
    ativos.push(['Período', `${fmtData(filtros.inicio) || '...'} → ${fmtData(filtros.fim) || '...'}`]);
  }
  if (filtros.numero) ativos.push(['Chamado #', filtros.numero]);
  if (filtros.cliente_nome) ativos.push(['Cliente', filtros.cliente_nome]);
  if (filtros.tecnico_nome) ativos.push(['Técnico', filtros.tecnico_nome]);
  if (filtros.status) ativos.push(['Status', STATUS_LABEL[filtros.status] || filtros.status]);
  if (filtros.tipo) ativos.push(['Tipo', capitalizar(filtros.tipo)]);
  if (filtros.urgencia) ativos.push(['Urgência', capitalizar(filtros.urgencia)]);

  // Cabeçalho do bloco
  ws.mergeCells(`A${startRow}:${last}${startRow}`);
  const head = ws.getCell(`A${startRow}`);
  head.value = 'FILTROS APLICADOS';
  head.font = { bold: true, size: 10, color: { argb: 'FF374151' } };
  head.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.muted } };
  head.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  ws.getRow(startRow).height = 20;

  if (ativos.length === 0) {
    const r = startRow + 1;
    ws.mergeCells(`A${r}:${last}${r}`);
    const c = ws.getCell(`A${r}`);
    c.value = 'Período completo — sem filtros aplicados';
    c.font = { italic: true, size: 10, color: { argb: 'FF6B7280' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.mutedSoft } };
    c.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    ws.getRow(r).height = 18;
    return r;
  }

  // Renderiza pares "Rótulo: valor" — 3 por linha, cada par ocupa colunas iguais
  const PARES_POR_LINHA = 3;
  const linhas = Math.ceil(ativos.length / PARES_POR_LINHA);
  const colSpan = Math.floor(ncols / PARES_POR_LINHA);

  for (let li = 0; li < linhas; li++) {
    const r = startRow + 1 + li;
    ws.getRow(r).height = 18;
    for (let pi = 0; pi < PARES_POR_LINHA; pi++) {
      const item = ativos[li * PARES_POR_LINHA + pi];
      const colIni = pi * colSpan + 1;
      const colFim = pi === PARES_POR_LINHA - 1 ? ncols : (pi + 1) * colSpan;
      const ref = `${String.fromCharCode(64 + colIni)}${r}:${String.fromCharCode(64 + colFim)}${r}`;
      ws.mergeCells(ref);
      const cell = ws.getCell(`${String.fromCharCode(64 + colIni)}${r}`);
      if (item) {
        cell.value = { richText: [
          { text: `${item[0]}: `, font: { bold: true, size: 10, color: { argb: 'FF374151' } } },
          { text: String(item[1]),  font: { size: 10, color: { argb: 'FF111827' } } },
        ]};
      }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.mutedSoft } };
      cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    }
  }

  return startRow + linhas;
}

function escreverKpis(ws, resumo, startRow) {
  // 6 cards, cada um ocupando ~2 colunas (total 11 cols). Last card pega coluna extra.
  const cards = [
    { label: 'TOTAL',          valor: resumo.total,                            cor: KPI_PALETTE.total },
    { label: 'CONCLUÍDOS',     valor: resumo.concluidos,                       cor: KPI_PALETTE.concluido },
    { label: 'DENTRO DO SLA',  valor: `${resumo.dentro_sla} (${resumo.percentual_sla}%)`, cor: KPI_PALETTE.dentroSla },
    { label: 'FORA DO SLA',    valor: resumo.fora_sla,                         cor: KPI_PALETTE.foraSla },
    { label: 'TEMPO MÉDIO',    valor: formatarMinutos(resumo.tempo_medio),     cor: KPI_PALETTE.tempo },
    { label: 'AVALIAÇÃO',      valor: resumo.avaliacao_media ? `${resumo.avaliacao_media} ★` : '—', cor: KPI_PALETTE.nota },
  ];

  // distribuição: cards 1-5 ocupam 2 cols, card 6 ocupa 1 col (5*2+1=11)
  const spans = [2, 2, 2, 2, 2, 1];
  const labelRow = startRow;
  const valueRow = startRow + 1;
  ws.getRow(labelRow).height = 16;
  ws.getRow(valueRow).height = 28;

  let col = 1;
  cards.forEach((card, i) => {
    const span = spans[i];
    const colIni = col;
    const colFim = col + span - 1;
    const colIniLetra = String.fromCharCode(64 + colIni);
    const colFimLetra = String.fromCharCode(64 + colFim);

    // Label
    if (span > 1) ws.mergeCells(`${colIniLetra}${labelRow}:${colFimLetra}${labelRow}`);
    const lc = ws.getCell(`${colIniLetra}${labelRow}`);
    lc.value = card.label;
    lc.font = { bold: true, size: 9, color: { argb: 'FFFFFFFF' } };
    lc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: card.cor } };
    lc.alignment = { horizontal: 'center', vertical: 'middle' };

    // Valor
    if (span > 1) ws.mergeCells(`${colIniLetra}${valueRow}:${colFimLetra}${valueRow}`);
    const vc = ws.getCell(`${colIniLetra}${valueRow}`);
    vc.value = card.valor;
    vc.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
    vc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: card.cor } };
    vc.alignment = { horizontal: 'center', vertical: 'middle' };

    col += span;
  });

  ws.getRow(valueRow + 1).height = 8; // separador
  return valueRow + 1;
}

function formatarMinutos(min) {
  if (!min || min <= 0) return '—';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

// ============================================================
// Relatório Histórico (XLSX) — usado pelo admin web
// ============================================================
async function gerarRelatorioHistoricoExcel(filtros, resumo, chamados) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Brucker Printers';
  wb.created = new Date();

  const ws = wb.addWorksheet('Histórico', {
    pageSetup: {
      paperSize: 9,
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 },
    },
  });

  const NCOLS = 11;

  // Larguras (definidas antes para os blocos superiores também respeitarem)
  const widths = [7, 26, 20, 18, 11, 11, 16, 17, 17, 12, 8];
  widths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });

  // Bloco 1: título
  escreverTituloInstitucional(ws, 'BRUCKER PRINTERS — Relatório de Histórico de Chamados', NCOLS);

  // Bloco 2: filtros (a partir da linha 4)
  const fimFiltros = escreverBlocoFiltros(ws, filtros, NCOLS, 4);

  // Bloco 3: KPIs (com 1 linha vazia de separador)
  ws.getRow(fimFiltros + 1).height = 6;
  const fimKpis = escreverKpis(ws, resumo, fimFiltros + 2);

  // Bloco 4: tabela de chamados
  const headerRowIdx = fimKpis + 1;
  const headers = ['#', 'Cliente', 'Impressora', 'Técnico', 'Tipo', 'Urgência', 'Status', 'Aberto em', 'Concluído em', 'SLA', 'Nota'];
  const headerRow = ws.getRow(headerRowIdx);
  headerRow.values = headers;
  aplicarEstiloHeader(headerRow);
  headerRow.height = 26;

  // Freeze pane logo abaixo do header
  ws.views = [{ state: 'frozen', ySplit: headerRowIdx }];

  // AutoFilter
  ws.autoFilter = {
    from: { row: headerRowIdx, column: 1 },
    to:   { row: headerRowIdx, column: NCOLS },
  };

  const COLS_NEUTRAS = ['A', 'B', 'C', 'D', 'E', 'H', 'I', 'K'];
  const COLS_CENTRO  = ['A', 'E', 'K'];

  chamados.forEach((c, idx) => {
    const linha = headerRowIdx + 1 + idx;
    const row = ws.getRow(linha);

    const concluidoEm = c.status === 'concluido' && c.atualizado_em ? new Date(c.atualizado_em) : null;
    let slaTxt = '-';
    if (c.status === 'concluido' && c.sla_vence_em) {
      slaTxt = new Date(c.atualizado_em) <= new Date(c.sla_vence_em) ? 'Cumprido' : 'Estourado';
    }
    const nota = (c.avaliacoes && c.avaliacoes[0] && c.avaliacoes[0].nota) || null;

    row.values = [
      c.numero,
      c.clientes?.nome || '-',
      c.impressoras?.modelo || '-',
      c.tecnicos?.nome || '-',
      c.tipo === 'preventivo' ? 'Preventivo' : (c.tipo === 'corretivo' ? 'Corretivo' : '-'),
      capitalizar(c.urgencia),
      statusTexto[c.status] || c.status || '-',
      c.criado_em ? new Date(c.criado_em) : null,
      concluidoEm,
      slaTxt,
      nota,
    ];
    row.height = 20;

    // Formatos nativos
    ws.getCell(`H${linha}`).numFmt = 'dd/mm/yyyy hh:mm';
    ws.getCell(`I${linha}`).numFmt = 'dd/mm/yyyy hh:mm';
    ws.getCell(`K${linha}`).numFmt = nota ? '0.0" ★"' : '@';
    if (!nota) ws.getCell(`K${linha}`).value = '—';

    // Estilo padrão nas colunas neutras
    COLS_NEUTRAS.forEach(col => {
      const cell = ws.getCell(`${col}${linha}`);
      cell.border = cellBorder;
      cell.alignment = {
        vertical: 'middle',
        horizontal: COLS_CENTRO.includes(col) ? 'center' : 'left',
        wrapText: false,
        indent: COLS_CENTRO.includes(col) ? 0 : 1,
      };
      if (!cell.font) cell.font = { size: 10, color: { argb: 'FF111827' } };
      // Zebra apenas onde não há badge
      if (idx % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.zebra } };
      }
    });

    // Badges coloridas
    pintarBadge(ws.getCell(`G${linha}`), STATUS_COLORS[c.status] || STATUS_COLORS.aberto, c.status === 'cancelado');
    pintarBadge(ws.getCell(`F${linha}`), URGENCIA_COLORS[c.urgencia] || URGENCIA_COLORS.normal, c.urgencia === 'critica');
    pintarBadge(ws.getCell(`J${linha}`), SLA_COLORS[slaTxt] || SLA_COLORS['-'], slaTxt === 'Estourado');
  });

  // Linha total
  const linhaTotal = headerRowIdx + 1 + chamados.length;
  ws.mergeCells(`A${linhaTotal}:K${linhaTotal}`);
  const totalCell = ws.getCell(`A${linhaTotal}`);
  totalCell.value = `Total: ${chamados.length} chamado${chamados.length !== 1 ? 's' : ''}`;
  totalCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
  totalCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.primary } };
  totalCell.alignment = { horizontal: 'right', vertical: 'middle', indent: 1 };
  ws.getRow(linhaTotal).height = 22;

  return wb.xlsx.writeBuffer();
}

module.exports = {
  gerarRelatorioPeriodoExcel,
  gerarRelatorioClientesExcel,
  gerarRelatorioTecnicosExcel,
  gerarRelatorioSlaExcel,
  gerarRelatorioPecasExcel,
  gerarRelatorioHistoricoExcel,
};
