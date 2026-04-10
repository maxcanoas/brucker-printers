const express = require('express');
const router = express.Router();
const chamadoController = require('../controllers/chamadoController');
const { autenticarCliente, autenticarAdmin, autenticarTecnico, autenticarStaff, autenticar } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Cliente: abrir chamado
router.post('/', autenticarCliente, upload.array('fotos', 5), chamadoController.criarChamado);

// Cliente: cancelar chamado
router.put('/:id/cancelar', autenticarCliente, chamadoController.cancelarChamado);

// Cliente: avaliar atendimento
router.post('/:id/avaliacao', autenticarCliente, chamadoController.criarAvaliacao);

// Admin: listar todos os chamados
router.get('/', autenticarAdmin, chamadoController.listarTodos);
router.get('/dashboard', autenticarAdmin, chamadoController.getDashboardAdmin);

// Admin: atualizar chamado (status, técnico)
router.put('/:id', autenticarAdmin, chamadoController.atualizarChamado);
router.put('/:id/atribuir', autenticarAdmin, chamadoController.atribuirTecnico);

// Técnico: listar chamados atribuídos
router.get('/meus', autenticarTecnico, chamadoController.getChamadosTecnico);

// Técnico: aceitar chamado atribuído
router.put('/:id/aceitar', autenticarTecnico, chamadoController.aceitarChamado);

// Staff (admin ou técnico): atualizar status
router.put('/:id/status', autenticarStaff, chamadoController.atualizarStatus);

// Qualquer usuário autenticado: detalhes e avaliação
router.get('/:id', autenticar, chamadoController.getDetalhesChamado);
router.get('/:id/avaliacao', autenticar, chamadoController.getAvaliacao);

module.exports = router;
