const express = require('express');
const router = express.Router();
const entrevistaTeoricaController = require('../controllers/entrevistaTeoricaController');

// Generar las 4 preguntas y crear registros en Evaluacion
router.get('/generar-evaluacion/:idPostulante', entrevistaTeoricaController.generarEvaluacion);

// Guardar la respuesta del postulante a una pregunta
router.post('/responder/:idEvaluacion', entrevistaTeoricaController.responderPregunta);
// Obtener las preguntas teóricas y técnicas asignadas al postulante
router.post('/pedir-ayuda', entrevistaTeoricaController.pedirAyudaIA);

router.get('/pregunta-tecnica-asignada/:idPostulante', entrevistaTeoricaController.obtenerPreguntaTecnicaAsignada);


module.exports = router;