const express = require('express');
const router = express.Router();
const chamadoController = require('../controllers/chamadoController');
const { autenticarCliente, autenticarAdmin, autenticarTecnico, autenticarStaff, autenticar } = require('../middleware/auth');

// Cliente: abrir chamado
router.post('/', autenticarCliente, chamadoController.criarChamado);

// Admin: listar todos os chamados
router.get('/', autenticarAdmin, chamadoController.listarTodos);
router.get('/dashboard', autenticarAdmin, chamadoController.getDashboardAdmin);

// Admin: atualizar chamado (status, técnico)
router.put('/:id', autenticarAdmin, chamadoController.atualizarChamado);
router.put('/:id/atribuir', autenticarAdmin, chamadoController.atribuirTecnico);

// Técnico: listar chamados atribuídos
router.get('/meus', autenticarTecnico, chamadoController.getChamadosTecnico);
router.put('/:id/status', autenticarStaff, chamadoController.atualizarStatus);

// Detalhes de um chamado (admin, técnico, ou cliente dono)
router.get('/:id', autenticar, chamadoController.getDetalhesChamado);

module.exports = router;
