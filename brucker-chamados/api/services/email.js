const nodemailer = require('nodemailer');
const supabase = require('./supabase');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function enviarEmail(para, assunto, html) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: para,
      subject: assunto,
      html,
    });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
  }
}

async function notificarNovoChamadoEmail(chamado, cliente) {
  try {
    // Buscar e-mails dos admins cadastrados no banco
    const { data: admins } = await supabase
      .from('admins')
      .select('email')
      .not('email', 'is', null);

    const emailsAdmins = (admins || []).map(a => a.email).filter(Boolean);

    // Adicionar e-mails fixos configurados no .env
    const emailsFixos = process.env.NOTIFY_EMAILS
      ? process.env.NOTIFY_EMAILS.split(',').map(e => e.trim()).filter(Boolean)
      : [];

    // Unir e remover duplicatas
    const emails = [...new Set([...emailsAdmins, ...emailsFixos])];
    if (emails.length === 0) return;

    const urgenciaTexto = {
      normal: 'Normal',
      alta: 'Alta',
      critica: 'Crítica',
    };

    const tipoTexto = {
      corretivo: 'Corretivo',
      preventivo: 'Preventivo',
    };

    const assunto = `Novo chamado #${chamado.numero} - ${urgenciaTexto[chamado.urgencia] || chamado.urgencia}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
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
      </div>
    `;

    const promises = emails.map(email => enviarEmail(email, assunto, html));
    await Promise.all(promises);
  } catch (error) {
    console.error('Erro ao notificar admins por e-mail:', error);
  }
}

module.exports = {
  enviarEmail,
  notificarNovoChamadoEmail,
};
