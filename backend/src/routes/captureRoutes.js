const express = require('express');
const router = express.Router();
const captureController = require('../controllers/captureController');

router.post('/', captureController.crearCapture);
router.get('/postulante/:idPostulante', captureController.getCapturasPorPostulante);
module.exports = router;
