// routes/preguntas.js
const express = require('express');
const router = express.Router();
const preguntasController = require('../controllers/preguntasController');

// GET /api/preguntas/vacante/:idVacante - Obtener preguntas por vacante
router.get('/vacante/:idVacante', preguntasController.getPreguntasByVacante);

router.get('/:id', preguntasController.getPreguntaById);

// POST /api/preguntas - Crear nueva pregunta
router.post('/', preguntasController.createPregunta);

// PUT /api/preguntas/:id - Actualizar pregunta
router.put('/:id', preguntasController.updatePregunta);

// DELETE /api/preguntas/:id - Eliminar pregunta
router.delete('/:id', preguntasController.deletePregunta);

// GET /api/preguntas/tecnica/vacante/:idVacante - Obtener preguntas técnicas por vacante
router.get('/tecnica/vacante/:idVacante', preguntasController.getPreguntasTecnicasByVacante);

// POST /api/preguntas/tecnica - Crear nueva pregunta técnica
router.post('/tecnica', preguntasController.createPreguntaTecnica);

// PUT /api/preguntas/tecnica/:idPregunta - Actualizar pregunta técnica
router.get('/tecnica/:idPregunta', preguntasController.getPreguntaTecnicaByPreguntaId);
// PUT /api/preguntas/tecnica/:idPregunta - Actualizar pregunta técnica
router.put('/tecnica/:idPregunta', preguntasController.updatePreguntaTecnica);


module.exports = router;