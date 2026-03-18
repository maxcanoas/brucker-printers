const PDFDocument = require('pdfkit');

function gerarRelatorioPDF(chamado, relatorio, cliente, tecnico) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Header
      doc.fontSize(20).font('Helvetica-Bold')
        .text('BRUCKER PRINTERS', { align: 'center' });
      doc.fontSize(12).font('Helvetica')
        .text('Relatório de Atendimento Técnico', { align: 'center' });
      doc.moveDown();

      // Linha divisória
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#E84C1E');
      doc.moveDown();

      // Informações do chamado
      doc.fontSize(14).font('Helvetica-Bold').text('Dados do Chamado');
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');

      const info = [
        ['Número do Chamado', `#${chamado.numero}`],
        ['Cliente', cliente.nome],
        ['Tipo', chamado.tipo === 'preventivo' ? 'Preventivo' : 'Corretivo'],
        ['Urgência', chamado.urgencia.charAt(0).toUpperCase() + chamado.urgencia.slice(1)],
        ['Impressora', chamado.impressora?.modelo || 'N/A'],
        ['Número de Série', chamado.impressora?.numero_serie || 'N/A'],
        ['Data de Abertura', new Date(chamado.criado_em).toLocaleString('pt-BR')],
        ['Data de Conclusão', new Date(relatorio.criado_em).toLocaleString('pt-BR')],
      ];

      info.forEach(([label, value]) => {
        doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
        doc.font('Helvetica').text(value);
      });

      doc.moveDown();

      // Descrição do problema
      doc.fontSize(14).font('Helvetica-Bold').text('Descrição do Problema');
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').text(chamado.descricao);
      doc.moveDown();

      // Serviço realizado
      doc.fontSize(14).font('Helvetica-Bold').text('Serviço Realizado');
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').text(relatorio.descricao_servico);
      doc.moveDown();

      // Peças utilizadas
      if (relatorio.pecas_utilizadas) {
        doc.fontSize(14).font('Helvetica-Bold').text('Peças Utilizadas');
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').text(relatorio.pecas_utilizadas);
        doc.moveDown();
      }

      // Duração
      if (relatorio.duracao_minutos) {
        doc.fontSize(14).font('Helvetica-Bold').text('Duração do Atendimento');
        doc.moveDown(0.5);
        const horas = Math.floor(relatorio.duracao_minutos / 60);
        const minutos = relatorio.duracao_minutos % 60;
        doc.fontSize(10).font('Helvetica')
          .text(`${horas > 0 ? horas + 'h ' : ''}${minutos}min`);
        doc.moveDown();
      }

      // Técnico
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#E84C1E');
      doc.moveDown();
      doc.fontSize(10).font('Helvetica-Bold').text(`Técnico Responsável: `, { continued: true });
      doc.font('Helvetica').text(tecnico.nome);
      doc.moveDown(2);

      // Assinatura
      doc.moveTo(50, doc.y).lineTo(250, doc.y).stroke();
      doc.moveDown(0.3);
      doc.fontSize(9).text('Assinatura do Técnico');

      doc.moveTo(300, doc.y - 15).lineTo(500, doc.y - 15).stroke();
      doc.moveUp(0.3);
      doc.text('Assinatura do Cliente', 300);

      // Footer
      doc.moveDown(3);
      doc.fontSize(8).fillColor('#8A94A6')
        .text('Brucker Printers - Venda e Locação de Impressoras', { align: 'center' });
      doc.text('contato@bruckerprinters.com.br | (51) 99737-1666', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { gerarRelatorioPDF };
