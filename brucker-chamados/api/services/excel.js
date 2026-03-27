const ExcelJS = require('exceljs');

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

module.exports = {
  gerarRelatorioPeriodoExcel,
  gerarRelatorioClientesExcel,
  gerarRelatorioTecnicosExcel,
  gerarRelatorioSlaExcel,
  gerarRelatorioPecasExcel,
};
