const express = require('express');
const router = express.Router();
const informeController = require('../controllers/informeController');

router.get('/:idPostulante', informeController.obtenerInformePostulante);

module.exports = router;
