const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { autenticarAdmin } = require('../middleware/auth');

// Dashboard
router.get('/dashboard', autenticarAdmin, adminController.getDashboard);

// Push token
router.post('/push-token', autenticarAdmin, adminController.registrarPushToken);

// Relatórios
router.get('/relatorios/periodo', autenticarAdmin, adminController.relatorioPorPeriodo);
router.get('/relatorios/clientes', autenticarAdmin, adminController.relatorioPorCliente);
router.get('/relatorios/tecnicos', autenticarAdmin, adminController.relatorioPorTecnico);

module.exports = router;
