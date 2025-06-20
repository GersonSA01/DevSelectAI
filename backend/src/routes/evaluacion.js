const express = require('express');
const router = express.Router();
const evaluacionController = require('../controllers/evaluacionController');

router.post('/inicial/:idPostulante', evaluacionController.crearEvaluacionInicial);
router.get('/obtener-evaluacion/:idPostulante', evaluacionController.obtenerEvaluacionTeorica);
router.post('/responder/:idEvaluacion', evaluacionController.responderPregunta);
router.get('/pregunta-tecnica-asignada/:idPostulante', evaluacionController.obtenerPreguntaTecnicaAsignada);
router.post('/guardar-respuesta-tecnica', evaluacionController.guardarRespuestaTecnica);
router.post('/pedir-ayuda', evaluacionController.pedirAyudaIA);


module.exports = router;

