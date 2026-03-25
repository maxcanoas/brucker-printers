const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { autenticarStaff } = require('../middleware/auth');

// Login cliente por código de acesso
router.post('/cliente/login', authController.loginCliente);

// Login admin (email + senha via Supabase Auth)
router.post('/admin/login', authController.loginAdmin);

// Login técnico (email + senha via Supabase Auth)
router.post('/tecnico/login', authController.loginTecnico);

// Solicitar redefinição de senha (público)
router.post('/esqueci-senha', authController.esqueciSenha);

// Alterar senha (admin ou técnico autenticado)
router.put('/alterar-senha', autenticarStaff, authController.alterarSenha);

module.exports = router;
