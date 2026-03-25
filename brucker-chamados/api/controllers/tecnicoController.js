const supabase = require('../services/supabase');

exports.listar = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tecnicos')
      .select('id, nome, email, whatsapp, ativo, criado_em')
      .order('nome');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar técnicos' });
  }
};

exports.criar = async (req, res) => {
  try {
    const { nome, email, whatsapp, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Formato de e-mail inválido' });
    }

    if (senha.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
    }

    if (nome.length > 200) {
      return res.status(400).json({ error: 'Nome deve ter no máximo 200 caracteres' });
    }

    // Criar user no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true
    });

    if (authError) {
      return res.status(400).json({ error: 'Erro ao criar usuário: ' + authError.message });
    }

    // Criar registro do técnico
    const { data, error } = await supabase
      .from('tecnicos')
      .insert({ nome, email, whatsapp, user_id: authData.user.id })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar técnico' });
  }
};

exports.atualizar = async (req, res) => {
  try {
    const { nome, email, whatsapp, ativo } = req.body;

    const { data, error } = await supabase
      .from('tecnicos')
      .update({ nome, email, whatsapp, ativo })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar técnico' });
  }
};

exports.desativar = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tecnicos')
      .update({ ativo: false })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Técnico desativado', data });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao desativar técnico' });
  }
};

exports.registrarPushToken = async (req, res) => {
  try {
    const { push_token } = req.body;
    if (!push_token) {
      return res.status(400).json({ error: 'push_token é obrigatório' });
    }

    const { data, error } = await supabase
      .from('tecnicos')
      .update({ push_token })
      .eq('id', req.usuario.id)
      .select('id, nome')
      .single();

    if (error) throw error;
    res.json({ message: 'Push token registrado', tecnico: data });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar push token' });
  }
};

exports.getMeuPerfil = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tecnicos')
      .select('id, nome, email, whatsapp, criado_em')
      .eq('id', req.usuario.id)
      .single();

    if (error) return res.status(404).json({ error: 'Técnico não encontrado' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
};

exports.getMinhasMetricas = async (req, res) => {
  try {
    const { data: chamados, error } = await supabase
      .from('chamados')
      .select('status, sla_vence_em, sla_tempo_pausado, criado_em, atualizado_em')
      .eq('tecnico_id', req.usuario.id);

    if (error) throw error;

    const metricas = {
      total: chamados.length,
      concluidos: 0,
      em_andamento: 0,
      dentro_sla: 0,
      fora_sla: 0
    };

    chamados.forEach(c => {
      if (c.status === 'concluido') {
        metricas.concluidos++;
        if (c.sla_vence_em && new Date(c.atualizado_em) <= new Date(c.sla_vence_em)) {
          metricas.dentro_sla++;
        } else {
          metricas.fora_sla++;
        }
      } else if (['em_atendimento', 'aguardando_peca'].includes(c.status)) {
        metricas.em_andamento++;
      }
    });

    metricas.percentual_sla = metricas.concluidos > 0
      ? Math.round((metricas.dentro_sla / metricas.concluidos) * 100)
      : 100;

    res.json(metricas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar métricas' });
  }
};
