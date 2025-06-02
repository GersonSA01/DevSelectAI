const express = require('express');
const router = express.Router();
const vacanteController = require('../controllers/vacanteController');

// GET habilidades de una vacante
router.get('/:idVacante/habilidades', vacanteController.getHabilidadesByVacante);

// (ya debes tener otras rutas como:)
router.get('/itinerario/:idItinerario', vacanteController.getByItinerario);
router.post('/', vacanteController.crearVacante);

// Rutas para CRUD de vacantes
router.get('/:id', vacanteController.getById); // Obtener por ID para edición
router.put('/:id', vacanteController.actualizarVacante); // Actualizar
router.delete('/:id', vacanteController.eliminarVacante); // Eliminar si no tiene preguntas

module.exports = router;
