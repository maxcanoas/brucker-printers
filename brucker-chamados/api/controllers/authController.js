const jwt = require('jsonwebtoken');
const supabase = require('../services/supabase');

function gerarToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
}

// Login do cliente por código de acesso
exports.loginCliente = async (req, res) => {
  try {
    const { codigo_acesso } = req.body;
    if (!codigo_acesso) {
      return res.status(400).json({ error: 'Código de acesso é obrigatório' });
    }

    const { data: cliente, error } = await supabase
      .from('clientes')
      .select('id, nome, email')
      .eq('codigo_acesso', codigo_acesso)
      .single();

    if (error || !cliente) {
      return res.status(401).json({ error: 'Código de acesso inválido' });
    }

    const token = gerarToken({
      id: cliente.id,
      nome: cliente.nome,
      tipo: 'cliente'
    });

    res.json({ token, cliente: { id: cliente.id, nome: cliente.nome, email: cliente.email } });
  } catch (error) {
    res.status(500).json({ error: 'Erro no login' });
  }
};

// Login do admin via Supabase Auth
exports.loginAdmin = async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: senha
    });

    if (authError) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const { data: admin, error } = await supabase
      .from('admins')
      .select('id, nome, email')
      .eq('user_id', authData.user.id)
      .single();

    if (error || !admin) {
      return res.status(403).json({ error: 'Usuário não é administrador' });
    }

    const token = gerarToken({
      id: admin.id,
      user_id: authData.user.id,
      nome: admin.nome,
      tipo: 'admin'
    });

    res.json({ token, admin: { id: admin.id, nome: admin.nome, email: admin.email } });
  } catch (error) {
    res.status(500).json({ error: 'Erro no login' });
  }
};

// Solicitar redefinição de senha (envia e-mail)
exports.esqueciSenha = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'E-mail é obrigatório' });
    }

    // Verificar se é admin ou técnico
    const { data: admin } = await supabase.from('admins').select('id').eq('email', email).single();
    const { data: tecnico } = await supabase.from('tecnicos').select('id').eq('email', email).single();

    if (!admin && !tecnico) {
      // Retorna sucesso mesmo se não encontrar, para não expor quais e-mails existem
      return res.json({ message: 'Se o e-mail estiver cadastrado, você receberá um link de redefinição.' });
    }

    const redirectUrl = `${process.env.FRONTEND_URL}/redefinir-senha`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });

    if (error) {
      console.error('Erro ao enviar e-mail de redefinição:', error);
      return res.status(500).json({ error: 'Erro ao enviar e-mail de redefinição' });
    }

    res.json({ message: 'Se o e-mail estiver cadastrado, você receberá um link de redefinição.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao processar solicitação' });
  }
};

// Alterar senha (admin ou técnico)
exports.alterarSenha = async (req, res) => {
  try {
    const { senha_atual, nova_senha } = req.body;
    if (!senha_atual || !nova_senha) {
      return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
    }

    if (nova_senha.length < 6) {
      return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres' });
    }

    // Buscar e-mail do usuário
    const tabela = req.usuario.tipo === 'admin' ? 'admins' : 'tecnicos';
    const { data: usuario } = await supabase
      .from(tabela)
      .select('email')
      .eq('id', req.usuario.id)
      .single();

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar senha atual
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: usuario.email,
      password: senha_atual
    });

    if (authError) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    // Atualizar senha
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      req.usuario.user_id,
      { password: nova_senha }
    );

    if (updateError) {
      return res.status(500).json({ error: 'Erro ao atualizar senha' });
    }

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao alterar senha' });
  }
};

// Login do técnico via Supabase Auth
exports.loginTecnico = async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: senha
    });

    if (authError) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const { data: tecnico, error } = await supabase
      .from('tecnicos')
      .select('id, nome, email, whatsapp')
      .eq('user_id', authData.user.id)
      .eq('ativo', true)
      .single();

    if (error || !tecnico) {
      return res.status(403).json({ error: 'Usuário não é técnico ou está inativo' });
    }

    const token = gerarToken({
      id: tecnico.id,
      user_id: authData.user.id,
      nome: tecnico.nome,
      tipo: 'tecnico'
    });

    res.json({ token, tecnico: { id: tecnico.id, nome: tecnico.nome, email: tecnico.email } });
  } catch (error) {
    res.status(500).json({ error: 'Erro no login' });
  }
};
