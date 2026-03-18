const jwt = require('jsonwebtoken');
const supabase = require('../services/supabase');

// Middleware de autenticação genérico
function autenticar(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// Middleware para acesso de cliente
function autenticarCliente(req, res, next) {
  autenticar(req, res, () => {
    if (req.usuario.tipo !== 'cliente') {
      return res.status(403).json({ error: 'Acesso restrito a clientes' });
    }
    next();
  });
}

// Middleware para acesso de admin
function autenticarAdmin(req, res, next) {
  autenticar(req, res, () => {
    if (req.usuario.tipo !== 'admin') {
      return res.status(403).json({ error: 'Acesso restrito a administradores' });
    }
    next();
  });
}

// Middleware para acesso de técnico
function autenticarTecnico(req, res, next) {
  autenticar(req, res, () => {
    if (req.usuario.tipo !== 'tecnico') {
      return res.status(403).json({ error: 'Acesso restrito a técnicos' });
    }
    next();
  });
}

// Middleware para admin OU técnico
function autenticarStaff(req, res, next) {
  autenticar(req, res, () => {
    if (req.usuario.tipo !== 'admin' && req.usuario.tipo !== 'tecnico') {
      return res.status(403).json({ error: 'Acesso restrito' });
    }
    next();
  });
}

module.exports = {
  autenticar,
  autenticarCliente,
  autenticarAdmin,
  autenticarTecnico,
  autenticarStaff
};
