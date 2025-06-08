const express = require('express');
const router = express.Router();
const entrevistaController = require('../controllers/entrevistaController');

router.post('/procesar-audio', entrevistaController.procesarAudio);

module.exports = router;
