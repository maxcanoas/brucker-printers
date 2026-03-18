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
