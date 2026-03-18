const express = require('express');
const router = express.Router();
const tecnicoController = require('../controllers/tecnicoController');
const { autenticarAdmin, autenticarTecnico } = require('../middleware/auth');

// Admin: gestão de técnicos
router.get('/', autenticarAdmin, tecnicoController.listar);
router.post('/', autenticarAdmin, tecnicoController.criar);
router.put('/:id', autenticarAdmin, tecnicoController.atualizar);
router.delete('/:id', autenticarAdmin, tecnicoController.desativar);

// Técnico: perfil, métricas e push token
router.get('/me', autenticarTecnico, tecnicoController.getMeuPerfil);
router.get('/me/metricas', autenticarTecnico, tecnicoController.getMinhasMetricas);
router.post('/me/push-token', autenticarTecnico, tecnicoController.registrarPushToken);

module.exports = router;
