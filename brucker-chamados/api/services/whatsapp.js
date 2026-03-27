const twilio = require('twilio');
const supabase = require('./supabase');

let client = null;

function getClient() {
  if (!client && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return client;
}

async function enviarNotificacao(telefone, mensagem) {
  if (!telefone) return null;
  const twilioClient = getClient();
  if (!twilioClient) {
    console.log('[WhatsApp] Twilio não configurado. Mensagem:', mensagem);
    return null;
  }

  try {
    const result = await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:+55${telefone.replace(/\D/g, '')}`,
      body: mensagem
    });
    console.log('[WhatsApp] Mensagem enviada:', result.sid);
    return result;
  } catch (error) {
    console.error('[WhatsApp] Erro ao enviar:', error.message);
    throw error;
  }
}

async function notificarTecnico(tecnico, chamado, cliente) {
  const mensagem = `🔧 *Novo chamado atribuído*\n\n` +
    `Chamado #${chamado.numero}\n` +
    `Cliente: ${cliente?.nome || 'N/A'}\n` +
    `Tipo: ${chamado.tipo}\n` +
    `Urgência: ${chamado.urgencia}\n` +
    `Descrição: ${chamado.descricao}\n\n` +
    `Acesse o app para aceitar e iniciar o atendimento.`;

  return enviarNotificacao(tecnico.whatsapp, mensagem);
}

const statusLabels = {
  aberto: 'Aberto',
  atribuido: 'Atribuído',
  em_atendimento: 'Em Atendimento',
  aguardando_peca: 'Aguardando Peça',
  concluido: 'Concluído',
  cancelado: 'Cancelado'
};

async function notificarStatusChamado(telefone, chamado, novoStatus) {
  const mensagem = `📋 *Atualização do Chamado #${chamado.numero}*\n\n` +
    `Novo status: ${statusLabels[novoStatus] || novoStatus}\n\n` +
    `Brucker Printers`;

  return enviarNotificacao(telefone, mensagem);
}

// Notificar admin via WhatsApp sobre novo chamado
async function notificarAdminWhatsApp(chamado, cliente, evento) {
  try {
    // Buscar whatsapp dos admins (via tabela admins, se tiver campo whatsapp, ou usar NOTIFY_PHONES env)
    const telefonesFixos = process.env.NOTIFY_PHONES
      ? process.env.NOTIFY_PHONES.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    if (telefonesFixos.length === 0) return;

    const mensagem = `📢 *Novo chamado aberto*\n\n` +
      `Chamado #${chamado.numero}\n` +
      `Cliente: ${cliente?.nome || 'N/A'}\n` +
      `Urgência: ${chamado.urgencia}\n` +
      `Descrição: ${(chamado.descricao || '').substring(0, 100)}\n\n` +
      `Acesse o painel para gerenciar.`;

    const promises = telefonesFixos.map(tel => enviarNotificacao(tel, mensagem));
    await Promise.all(promises);
  } catch (error) {
    console.error('[WhatsApp] Erro ao notificar admin:', error.message);
  }
}

// Notificar cliente via WhatsApp quando chamado for concluído
async function notificarClienteConcluidoWhatsApp(telefoneCliente, chamado) {
  if (!telefoneCliente) return;

  const mensagem = `✅ *Chamado #${chamado.numero} concluído*\n\n` +
    `Seu chamado foi finalizado com sucesso.\n` +
    `Acesse o portal para avaliar o atendimento.\n\n` +
    `Brucker Printers`;

  return enviarNotificacao(telefoneCliente, mensagem);
}

module.exports = {
  enviarNotificacao,
  notificarTecnico,
  notificarStatusChamado,
  notificarAdminWhatsApp,
  notificarClienteConcluidoWhatsApp,
};
