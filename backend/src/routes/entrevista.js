const express = require('express');
const router = express.Router();
const entrevistaController = require('../controllers/entrevistaController');

router.post('/procesar-audio', entrevistaController.procesarAudio);
router.get('/getPreguntasOrales/:idEntrevista', entrevistaController.getPreguntasOrales);

module.exports = router;
