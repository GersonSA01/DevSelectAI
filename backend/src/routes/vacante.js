const express = require('express');
const router = express.Router();
const vacanteController = require('../controllers/vacanteController');

// GET habilidades de una vacante
router.get('/:idVacante/habilidades', vacanteController.getHabilidadesByVacante);

// Vacantes por itinerario
router.get('/itinerario/:idItinerario', vacanteController.getByItinerario);

// Crear vacante
router.post('/', vacanteController.crearVacante);

// Vacante por ID (edición)
router.get('/:id', vacanteController.getById);
router.put('/:id', vacanteController.actualizarVacante);
router.delete('/:id', vacanteController.eliminarVacante);

// 🔍 Vacantes según habilidades seleccionadas
router.post('/por-habilidades', vacanteController.getVacantesPorHabilidades);

module.exports = router;
