const express = require('express');
const router = express.Router();
const impressoraController = require('../controllers/impressoraController');
const { autenticarAdmin, autenticarCliente, autenticar } = require('../middleware/auth');

// Buscar por número de série (cliente usa ao abrir chamado)
router.get('/buscar/:numero_serie', autenticar, impressoraController.buscarPorSerie);

// Admin: gestão de impressoras
router.get('/', autenticarAdmin, impressoraController.listar);
router.get('/cliente/:cliente_id', autenticarAdmin, impressoraController.listarPorCliente);
router.post('/', autenticarAdmin, impressoraController.criar);
router.put('/:id', autenticarAdmin, impressoraController.atualizar);
router.put('/:id/desativar', autenticarAdmin, impressoraController.desativar);
router.put('/:id/reativar', autenticarAdmin, impressoraController.reativar);

module.exports = router;
