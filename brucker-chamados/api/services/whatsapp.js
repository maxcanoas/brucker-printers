const twilio = require('twilio');

let client = null;

function getClient() {
  if (!client && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return client;
}

async function enviarNotificacao(telefone, mensagem) {
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
    `Cliente: ${cliente.nome}\n` +
    `Tipo: ${chamado.tipo}\n` +
    `Urgência: ${chamado.urgencia}\n` +
    `Descrição: ${chamado.descricao}\n\n` +
    `Acesse o app para mais detalhes.`;

  return enviarNotificacao(tecnico.whatsapp, mensagem);
}

async function notificarStatusChamado(telefone, chamado, novoStatus) {
  const statusLabels = {
    aberto: 'Aberto',
    em_atendimento: 'Em Atendimento',
    aguardando_peca: 'Aguardando Peça',
    concluido: 'Concluído',
    cancelado: 'Cancelado'
  };

  const mensagem = `📋 *Atualização do Chamado #${chamado.numero}*\n\n` +
    `Novo status: ${statusLabels[novoStatus] || novoStatus}\n\n` +
    `Brucker Printers`;

  return enviarNotificacao(telefone, mensagem);
}

module.exports = { enviarNotificacao, notificarTecnico, notificarStatusChamado };
