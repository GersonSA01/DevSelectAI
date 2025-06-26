const express = require('express');
const router = express.Router();
const vacanteController = require('../controllers/vacanteController');

// 🔍 Vacantes según habilidades seleccionadas (¡primero las rutas específicas!)
router.post('/por-habilidades', vacanteController.getVacantesPorHabilidades);

// Vacantes por itinerario
router.get('/itinerario/:idItinerario', vacanteController.getByItinerario);

// GET habilidades de una vacante
router.get('/:idVacante/habilidades', vacanteController.getHabilidadesByVacante);

// Crear vacante
router.post('/', vacanteController.crearVacante);

// Vacante por ID (edición)
router.get('/:id', vacanteController.getById);
router.put('/:id', vacanteController.actualizarVacante);
router.delete('/:id', vacanteController.eliminarVacante);

module.exports = router;
