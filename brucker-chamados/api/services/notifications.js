const supabase = require('./supabase');

async function enviarPushNotification(pushToken, titulo, corpo, dados = {}) {
  if (!pushToken) return;

  const message = {
    to: pushToken,
    sound: 'default',
    title: titulo,
    body: corpo,
    data: dados,
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    if (result.data?.status === 'error') {
      console.error('Expo push error:', result.data.message);
    }
    return result;
  } catch (error) {
    console.error('Erro ao enviar push notification:', error);
  }
}

async function notificarAdminsPush(titulo, corpo, dados = {}) {
  try {
    const { data: admins } = await supabase
      .from('admins')
      .select('push_token')
      .not('push_token', 'is', null);

    if (!admins || admins.length === 0) return;

    const promises = admins
      .filter(a => a.push_token)
      .map(a => enviarPushNotification(a.push_token, titulo, corpo, dados));

    await Promise.all(promises);
  } catch (error) {
    console.error('Erro ao notificar admins:', error);
  }
}

async function notificarNovoChamado(chamado, cliente) {
  const titulo = 'Novo chamado aberto';
  const corpo = `#${chamado.numero} - ${cliente?.nome || 'Cliente'} - ${chamado.urgencia}`;
  const dados = { chamado_id: chamado.id, tipo: 'novo_chamado' };

  return notificarAdminsPush(titulo, corpo, dados);
}

async function notificarTecnicoPush(tecnico, chamado, cliente) {
  if (!tecnico.push_token) return;

  const titulo = 'Novo chamado atribuído';
  const corpo = `Chamado #${chamado.numero} - ${cliente?.nome || 'Cliente'}`;
  const dados = { chamado_id: chamado.id, tipo: 'novo_chamado' };

  return enviarPushNotification(tecnico.push_token, titulo, corpo, dados);
}

async function notificarStatusPush(chamado, novoStatus) {
  const statusTexto = {
    aberto: 'Aberto',
    em_atendimento: 'Em Atendimento',
    aguardando_peca: 'Aguardando Peça',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
  };

  // Notificar técnico sobre mudança de status
  if (chamado.tecnico_id) {
    const { data: tecnico } = await supabase
      .from('tecnicos')
      .select('push_token, nome')
      .eq('id', chamado.tecnico_id)
      .single();

    if (tecnico?.push_token) {
      await enviarPushNotification(
        tecnico.push_token,
        `Chamado #${chamado.numero} atualizado`,
        `Status: ${statusTexto[novoStatus] || novoStatus}`,
        { chamado_id: chamado.id, tipo: 'status_atualizado' }
      );
    }
  }

  // Notificar admins sobre mudança de status
  await notificarAdminsPush(
    `Chamado #${chamado.numero} atualizado`,
    `Status: ${statusTexto[novoStatus] || novoStatus}`,
    { chamado_id: chamado.id, tipo: 'status_atualizado' }
  );
}

module.exports = {
  enviarPushNotification,
  notificarAdminsPush,
  notificarNovoChamado,
  notificarTecnicoPush,
  notificarStatusPush,
};
