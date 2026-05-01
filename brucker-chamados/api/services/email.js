const supabase = require('./supabase');

// Render bloqueia portas SMTP outbound (ETIMEDOUT em 587 e 465 mesmo com IPv4),
// entao usamos Brevo via API HTTPS (api.brevo.com). Migrado do Resend porque
// dominio bruckerprinters.com.br ainda nao verificado no Resend (DNS no
// Cloudflare via HostGator, sem acesso direto).
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const FROM_RAW = process.env.SMTP_FROM || 'Brucker Chamados <bruckerparts@gmail.com>';

// Parse "Nome <email@dominio>" -> { name, email }
function parseFrom(raw) {
  const m = raw.match(/^\s*(.+?)\s*<\s*([^>]+)\s*>\s*$/);
  if (m) return { name: m[1], email: m[2] };
  return { name: 'Brucker Chamados', email: raw.trim() };
}
const FROM = parseFrom(FROM_RAW);

async function enviarEmail(para, assunto, html, attachments) {
  console.log('[email] Tentando enviar para', para, '| assunto:', assunto,
    '| from:', `${FROM.name} <${FROM.email}>`, '| anexos:', attachments?.length || 0);
  if (!BREVO_API_KEY) {
    console.error('[email] BREVO_API_KEY nao configurada — abortando envio');
    return;
  }
  try {
    const destinatarios = (Array.isArray(para) ? para : [para])
      .filter(Boolean)
      .map(e => ({ email: e }));
    const payload = {
      sender: FROM,
      to: destinatarios,
      subject: assunto,
      htmlContent: html,
    };
    if (attachments && attachments.length) {
      payload.attachment = attachments.map(a => ({
        name: a.filename,
        content: (Buffer.isBuffer(a.content) ? a.content : Buffer.from(a.content)).toString('base64'),
      }));
    }
    const resp = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      const body = await resp.text();
      console.error('[email] Falha ao enviar para', para, '| assunto:', assunto,
        '| status:', resp.status, '| body:', body);
      return;
    }
    const data = await resp.json();
    console.log('[email] OK enviado para', para, '| id:', data?.messageId);
  } catch (error) {
    console.error('[email] Falha ao enviar para', para, '| assunto:', assunto,
      '| msg:', error.message);
  }
}

const statusTexto = {
  aberto: 'Aberto',
  atribuido: 'Atribuído',
  em_atendimento: 'Em Atendimento',
  aguardando_peca: 'Aguardando Peça',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

const statusCor = {
  aberto: '#4D8EF5',
  atribuido: '#9B59B6',
  em_atendimento: '#C9A227',
  aguardando_peca: '#E84C1E',
  concluido: '#3D9E6B',
  cancelado: '#8A94A6',
};

const urgenciaTexto = {
  normal: 'Normal',
  alta: 'Alta',
  critica: 'Crítica',
};

const tipoTexto = {
  corretivo: 'Corretivo',
  preventivo: 'Preventivo',
};

function wrapEmail(conteudo) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      ${conteudo}
      <div style="margin-top: 16px; padding: 12px; background: #f9f9f9; border-radius: 4px;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          Brucker Printers — Sistema de Chamados
        </p>
      </div>
    </div>
  `;
}

// Resolve lista de destinatários admin. Se NOTIFY_EMAILS estiver definido,
// ele é a única fonte; caso contrário, usa os e-mails da tabela admins.
async function listarDestinatariosAdmin() {
  if (process.env.NOTIFY_EMAILS) {
    return process.env.NOTIFY_EMAILS
      .split(',').map(e => e.trim()).filter(Boolean);
  }
  const { data: admins } = await supabase
    .from('admins')
    .select('email')
    .not('email', 'is', null);
  return (admins || []).map(a => a.email).filter(Boolean);
}

// Notificar admins sobre novo chamado (já existia)
async function notificarNovoChamadoEmail(chamado, cliente) {
  try {
    const emails = await listarDestinatariosAdmin();
    if (emails.length === 0) return;

    const assunto = `Novo chamado #${chamado.numero} - ${urgenciaTexto[chamado.urgencia] || chamado.urgencia}`;

    const html = wrapEmail(`
      <div style="background-color: #111111; padding: 20px; border-radius: 8px 8px 0 0; border-top: 4px solid #dc2626;">
        <h2 style="margin: 0; color: #facc15;">Novo Chamado Aberto</h2>
      </div>
      <div style="border: 1px solid #e5e7eb; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #111111;">Número:</td>
            <td style="padding: 8px 0;">#${chamado.numero}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #111111;">Cliente:</td>
            <td style="padding: 8px 0;">${cliente?.nome || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #111111;">Tipo:</td>
            <td style="padding: 8px 0;">${tipoTexto[chamado.tipo] || chamado.tipo}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #111111;">Urgência:</td>
            <td style="padding: 8px 0; color: ${chamado.urgencia === 'critica' ? '#dc2626' : chamado.urgencia === 'alta' ? '#facc15' : '#16a34a'}; font-weight: bold;">
              ${urgenciaTexto[chamado.urgencia] || chamado.urgencia}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #111111;">SLA:</td>
            <td style="padding: 8px 0;">${chamado.sla_horas}h</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #111111; vertical-align: top;">Descrição:</td>
            <td style="padding: 8px 0;">${chamado.descricao || 'Sem descrição'}</td>
          </tr>
        </table>
        <hr style="border: none; border-top: 2px solid #dc2626; margin: 16px 0;" />
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          Acesse o painel administrativo para gerenciar este chamado.
        </p>
      </div>
    `);

    const promises = emails.map(email => enviarEmail(email, assunto, html));
    await Promise.all(promises);
  } catch (error) {
    console.error('[email] Falha em notificarNovoChamadoEmail | chamado:', chamado?.numero,
      '| code:', error.code, '| msg:', error.message);
  }
}

// Notificar admins sobre mudança de status de chamado
async function notificarAdminsStatusEmail(chamado, novoStatus, cliente) {
  try {
    const emails = await listarDestinatariosAdmin();
    if (emails.length === 0) return;

    const cor = statusCor[novoStatus] || '#333';
    const nomeCliente = cliente?.nome || chamado.clientes?.nome || 'N/A';
    const assunto = `Chamado #${chamado.numero} — ${statusTexto[novoStatus] || novoStatus}`;

    const html = wrapEmail(`
      <div style="background-color: #111111; padding: 20px; border-radius: 8px 8px 0 0; border-top: 4px solid ${cor};">
        <h2 style="margin: 0; color: #ffffff;">Atualização de Chamado</h2>
      </div>
      <div style="border: 1px solid #e5e7eb; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
        <div style="background: ${cor}20; border-left: 4px solid ${cor}; padding: 12px 16px; margin: 0 0 16px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: ${cor};">
            ${statusTexto[novoStatus] || novoStatus}
          </p>
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #555;">Chamado:</td>
            <td style="padding: 6px 0;">#${chamado.numero}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #555;">Cliente:</td>
            <td style="padding: 6px 0;">${nomeCliente}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #555;">Tipo:</td>
            <td style="padding: 6px 0;">${tipoTexto[chamado.tipo] || chamado.tipo}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #555;">Urgência:</td>
            <td style="padding: 6px 0;">${urgenciaTexto[chamado.urgencia] || chamado.urgencia}</td>
          </tr>
        </table>
        <p style="color: #6b7280; font-size: 12px; margin-top: 16px;">
          Acesse o painel administrativo para mais detalhes.
        </p>
      </div>
    `);

    const promises = emails.map(email => enviarEmail(email, assunto, html));
    await Promise.all(promises);
  } catch (error) {
    console.error('[email] Falha em notificarAdminsStatusEmail | chamado:', chamado?.numero,
      '| status:', novoStatus, '| code:', error.code, '| msg:', error.message);
  }
}

// Notificar cliente sobre mudança de status
async function notificarClienteStatusEmail(cliente, chamado, novoStatus, pdfBuffer) {
  if (!cliente?.email) return;

  const cor = statusCor[novoStatus] || '#333';
  const assunto = `Chamado #${chamado.numero} — ${statusTexto[novoStatus] || novoStatus}`;

  const html = wrapEmail(`
    <div style="background-color: #111111; padding: 20px; border-radius: 8px 8px 0 0; border-top: 4px solid ${cor};">
      <h2 style="margin: 0; color: #ffffff;">Atualização do Chamado #${chamado.numero}</h2>
    </div>
    <div style="border: 1px solid #e5e7eb; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
      <p style="font-size: 16px;">Olá, <strong>${cliente.nome}</strong>!</p>
      <p>O seu chamado <strong>#${chamado.numero}</strong> teve uma atualização:</p>
      <div style="background: ${cor}20; border-left: 4px solid ${cor}; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 18px; font-weight: bold; color: ${cor};">
          ${statusTexto[novoStatus] || novoStatus}
        </p>
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #555;">Tipo:</td>
          <td style="padding: 6px 0;">${tipoTexto[chamado.tipo] || chamado.tipo}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #555;">Urgência:</td>
          <td style="padding: 6px 0;">${urgenciaTexto[chamado.urgencia] || chamado.urgencia}</td>
        </tr>
      </table>
      <p style="color: #6b7280; font-size: 13px; margin-top: 16px;">
        Acompanhe seus chamados acessando o portal com seu código de acesso.
      </p>
    </div>
  `);

  const attachments = pdfBuffer ? [{
    filename: `chamado-${chamado.numero}-relatorio.pdf`,
    content: pdfBuffer,
    contentType: 'application/pdf',
  }] : undefined;

  await enviarEmail(cliente.email, assunto, html, attachments);
}

// Notificar técnico quando atribuído a um chamado
async function notificarTecnicoAtribuidoEmail(tecnico, chamado, cliente) {
  if (!tecnico?.email) return;

  const assunto = `Novo chamado atribuído — #${chamado.numero}`;

  const html = wrapEmail(`
    <div style="background-color: #111111; padding: 20px; border-radius: 8px 8px 0 0; border-top: 4px solid #9B59B6;">
      <h2 style="margin: 0; color: #ffffff;">Chamado Atribuído a Você</h2>
    </div>
    <div style="border: 1px solid #e5e7eb; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
      <p style="font-size: 16px;">Olá, <strong>${tecnico.nome}</strong>!</p>
      <p>Um novo chamado foi atribuído a você. <strong>Acesse o app para aceitar.</strong></p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #555;">Chamado:</td>
          <td style="padding: 6px 0;">#${chamado.numero}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #555;">Cliente:</td>
          <td style="padding: 6px 0;">${cliente?.nome || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #555;">Tipo:</td>
          <td style="padding: 6px 0;">${tipoTexto[chamado.tipo] || chamado.tipo}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #555;">Urgência:</td>
          <td style="padding: 6px 0;">${urgenciaTexto[chamado.urgencia] || chamado.urgencia}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #555; vertical-align: top;">Descrição:</td>
          <td style="padding: 6px 0;">${chamado.descricao || 'Sem descrição'}</td>
        </tr>
      </table>
    </div>
  `);

  await enviarEmail(tecnico.email, assunto, html);
}

// Confirmar ao cliente que o chamado dele foi aberto com sucesso
async function notificarClienteChamadoAbertoEmail(cliente, chamado) {
  if (!cliente?.email) return;

  const assunto = `Chamado #${chamado.numero} aberto com sucesso`;

  const html = wrapEmail(`
    <div style="background-color: #111111; padding: 20px; border-radius: 8px 8px 0 0; border-top: 4px solid #4D8EF5;">
      <h2 style="margin: 0; color: #ffffff;">Chamado Aberto</h2>
    </div>
    <div style="border: 1px solid #e5e7eb; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
      <p style="font-size: 16px;">Olá, <strong>${cliente.nome}</strong>!</p>
      <p>Seu chamado foi aberto com sucesso e já está na fila de atendimento. Você receberá novos e-mails a cada mudança de status.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #555;">Número:</td>
          <td style="padding: 6px 0;">#${chamado.numero}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #555;">Tipo:</td>
          <td style="padding: 6px 0;">${tipoTexto[chamado.tipo] || chamado.tipo}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #555;">Urgência:</td>
          <td style="padding: 6px 0;">${urgenciaTexto[chamado.urgencia] || chamado.urgencia}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #555;">SLA:</td>
          <td style="padding: 6px 0;">${chamado.sla_horas}h</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #555; vertical-align: top;">Descrição:</td>
          <td style="padding: 6px 0;">${chamado.descricao || 'Sem descrição'}</td>
        </tr>
      </table>
      <p style="color: #6b7280; font-size: 13px; margin-top: 16px;">
        Acompanhe o andamento no portal com seu código de acesso.
      </p>
    </div>
  `);

  await enviarEmail(cliente.email, assunto, html);
}

// Notificar cliente sobre conclusão do chamado (com convite para avaliar)
async function notificarChamadoConcluidoEmail(cliente, chamado, pdfBuffer) {
  if (!cliente?.email) return;

  const assunto = `Chamado #${chamado.numero} concluído — Avalie o atendimento`;

  const html = wrapEmail(`
    <div style="background-color: #111111; padding: 20px; border-radius: 8px 8px 0 0; border-top: 4px solid #3D9E6B;">
      <h2 style="margin: 0; color: #3D9E6B;">Chamado Concluído</h2>
    </div>
    <div style="border: 1px solid #e5e7eb; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
      <p style="font-size: 16px;">Olá, <strong>${cliente.nome}</strong>!</p>
      <p>O chamado <strong>#${chamado.numero}</strong> foi concluído com sucesso.</p>
      <div style="background: #3D9E6B20; border-left: 4px solid #3D9E6B; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 16px; color: #3D9E6B; font-weight: bold;">
          ✓ Atendimento finalizado
        </p>
      </div>
      <p style="margin-top: 16px;">
        <strong>Avalie o atendimento!</strong> Acesse o portal com seu código de acesso,
        abra o chamado concluído e deixe sua avaliação. Sua opinião é muito importante para nós.
      </p>
      ${pdfBuffer ? `<p style="color: #6b7280; font-size: 13px; margin-top: 12px;">
        Em anexo, o relatório completo do atendimento em PDF.
      </p>` : ''}
    </div>
  `);

  const attachments = pdfBuffer ? [{
    filename: `chamado-${chamado.numero}-relatorio.pdf`,
    content: pdfBuffer,
    contentType: 'application/pdf',
  }] : undefined;

  await enviarEmail(cliente.email, assunto, html, attachments);
}

// Notificar cliente sobre criação do relatório de atendimento
async function notificarRelatorioEmail(cliente, chamado, pdfBuffer) {
  if (!cliente?.email) return;

  const assunto = `Relatório de atendimento — Chamado #${chamado.numero}`;

  const html = wrapEmail(`
    <div style="background-color: #111111; padding: 20px; border-radius: 8px 8px 0 0; border-top: 4px solid #4D8EF5;">
      <h2 style="margin: 0; color: #ffffff;">Relatório de Atendimento</h2>
    </div>
    <div style="border: 1px solid #e5e7eb; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
      <p style="font-size: 16px;">Olá, <strong>${cliente.nome}</strong>!</p>
      <p>O relatório de atendimento do chamado <strong>#${chamado.numero}</strong> foi gerado.</p>
      ${pdfBuffer ? `<p>Em anexo, você encontra o PDF com os detalhes do atendimento: descrição do serviço, peças utilizadas, duração, avaliação e assinaturas.</p>` : ''}
      <p style="color: #6b7280; font-size: 13px; margin-top: 16px;">
        Acesse o portal com seu código de acesso para visualizar os detalhes.
      </p>
    </div>
  `);

  const attachments = pdfBuffer ? [{
    filename: `chamado-${chamado.numero}-relatorio.pdf`,
    content: pdfBuffer,
    contentType: 'application/pdf',
  }] : undefined;

  await enviarEmail(cliente.email, assunto, html, attachments);
}

// E-mail de redefinição de senha (admin ou técnico)
async function enviarEmailRedefinicaoSenha(email, nome, link) {
  const assunto = 'Redefinição de senha — Brucker Chamados';

  const html = wrapEmail(`
    <div style="background-color: #111111; padding: 20px; border-radius: 8px 8px 0 0; border-top: 4px solid #facc15;">
      <h2 style="margin: 0; color: #facc15;">Redefinição de Senha</h2>
    </div>
    <div style="border: 1px solid #e5e7eb; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
      <p style="font-size: 16px;">Olá${nome ? `, <strong>${nome}</strong>` : ''}!</p>
      <p>Recebemos uma solicitação para redefinir a senha da sua conta no sistema de chamados da Brucker Printers.</p>
      <p>Clique no botão abaixo para criar uma nova senha:</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="${link}" style="display: inline-block; background-color: #facc15; color: #111111; font-weight: bold; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
          Redefinir senha
        </a>
      </p>
      <p style="color: #6b7280; font-size: 13px;">
        Caso o botão não funcione, copie e cole o link abaixo no seu navegador:
      </p>
      <p style="word-break: break-all; font-size: 12px; color: #4D8EF5;">
        <a href="${link}" style="color: #4D8EF5;">${link}</a>
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        Se você não solicitou esta redefinição, ignore este e-mail. Sua senha atual permanecerá inalterada.
      </p>
    </div>
  `);

  // Nao usa enviarEmail() porque ele engole erros — aqui precisamos propagar
  // a falha para o controller responder corretamente ao usuario.
  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY nao configurada');
  }
  const resp = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'content-type': 'application/json',
      'accept': 'application/json',
    },
    body: JSON.stringify({
      sender: FROM,
      to: [{ email }],
      subject: assunto,
      htmlContent: html,
    }),
  });
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Brevo ${resp.status}: ${body}`);
  }
}

module.exports = {
  enviarEmail,
  notificarNovoChamadoEmail,
  notificarAdminsStatusEmail,
  notificarClienteStatusEmail,
  notificarClienteChamadoAbertoEmail,
  notificarTecnicoAtribuidoEmail,
  notificarChamadoConcluidoEmail,
  notificarRelatorioEmail,
  enviarEmailRedefinicaoSenha,
};
