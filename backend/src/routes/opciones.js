const express = require('express');
const router = express.Router();
const opcionesController = require('../controllers/opcionesController');
const auth = require("../../middlewares/auth");

router.post('/', auth("reclutador"), opcionesController.create);


router.get('/pregunta/:idPregunta', auth("reclutador"), opcionesController.getByPregunta);


router.delete('/pregunta/:idPregunta', auth("reclutador"), opcionesController.deleteByPregunta);

module.exports = router;
