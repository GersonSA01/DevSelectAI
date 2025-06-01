// routes/preguntas.js
const express = require('express');
const router = express.Router();
const preguntasController = require('../controllers/preguntasController');

// GET /api/preguntas/vacante/:idVacante - Obtener preguntas por vacante
router.get('/vacante/:idVacante', preguntasController.getPreguntasByVacante);

// POST /api/preguntas - Crear nueva pregunta
router.post('/', preguntasController.createPregunta);

// PUT /api/preguntas/:id - Actualizar pregunta
router.put('/:id', preguntasController.updatePregunta);

// DELETE /api/preguntas/:id - Eliminar pregunta
router.delete('/:id', preguntasController.deletePregunta);

module.exports = router;