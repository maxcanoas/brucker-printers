const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { autenticarCliente, autenticarAdmin } = require('../middleware/auth');

// Rotas do cliente (área do cliente)
router.get('/me', autenticarCliente, clienteController.getPerfilCliente);
router.get('/me/chamados', autenticarCliente, clienteController.getMeusChamados);
router.get('/me/impressoras', autenticarCliente, clienteController.getMinhasImpressoras);
router.get('/me/dashboard', autenticarCliente, clienteController.getDashboard);

// Admin: gestão de clientes
router.get('/', autenticarAdmin, clienteController.listarClientes);
router.get('/:id', autenticarAdmin, clienteController.getCliente);
router.post('/', autenticarAdmin, clienteController.criarCliente);
router.put('/:id', autenticarAdmin, clienteController.atualizarCliente);
router.post('/:id/novo-codigo', autenticarAdmin, clienteController.gerarNovoCodigo);
router.delete('/:id', autenticarAdmin, clienteController.desativar);

module.exports = router;
