const express = require('express');
const router = express.Router();
const relatorioController = require('../controllers/relatorioController');
const { autenticarTecnico, autenticarAdmin, autenticarStaff } = require('../middleware/auth');

// Técnico: criar relatório ao encerrar chamado
router.post('/', autenticarTecnico, relatorioController.criar);

// Gerar PDF do relatório
router.get('/:id/pdf', autenticarStaff, relatorioController.gerarPDF);

// Admin: relatórios gerenciais
router.get('/mensal', autenticarAdmin, relatorioController.relatorioMensal);

module.exports = router;
