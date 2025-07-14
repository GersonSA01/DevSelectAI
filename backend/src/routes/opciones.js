const express = require('express');
const router = express.Router();
const opcionesController = require('../controllers/opcionesController');


router.post('/', opcionesController.create);


router.get('/pregunta/:idPregunta', opcionesController.getByPregunta);


router.delete('/pregunta/:idPregunta', opcionesController.deleteByPregunta);

module.exports = router;
