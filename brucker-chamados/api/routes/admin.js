const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const chamadoController = require('../controllers/chamadoController');
const { autenticarAdmin } = require('../middleware/auth');

// Dashboard
router.get('/dashboard', autenticarAdmin, adminController.getDashboard);

// Avaliações
router.get('/avaliacoes', autenticarAdmin, chamadoController.listarAvaliacoes);

// Push token
router.post('/push-token', autenticarAdmin, adminController.registrarPushToken);

// Relatório de histórico (suporta ?formato=pdf|xlsx para exportação)
router.get('/relatorios/historico', autenticarAdmin, adminController.relatorioHistorico);

module.exports = router;
