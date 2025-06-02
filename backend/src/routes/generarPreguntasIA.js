const express = require('express');
const router = express.Router();
const { generarPreguntas } = require('../controllers/generarPreguntasIAController');

router.post('/:idVacante', generarPreguntas);

module.exports = router;
