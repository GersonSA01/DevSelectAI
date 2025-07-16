const express = require('express');
const router = express.Router();
const { generarPreguntas } = require('../controllers/generarPreguntasIAController');
const auth = require("../../middlewares/auth");

router.post('/:idVacante', auth("reclutador"), generarPreguntas);

module.exports = router;
