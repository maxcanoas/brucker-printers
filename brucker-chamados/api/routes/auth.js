const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Login cliente por código de acesso
router.post('/cliente/login', authController.loginCliente);

// Login admin (email + senha via Supabase Auth)
router.post('/admin/login', authController.loginAdmin);

// Login técnico (email + senha via Supabase Auth)
router.post('/tecnico/login', authController.loginTecnico);

module.exports = router;
