const express = require('express');
const router = express.Router();
const vacanteController = require('../controllers/vacanteController');

// GET habilidades de una vacante
router.get('/:idVacante/habilidades', vacanteController.getHabilidadesByVacante);

// (ya debes tener otras rutas como:)
router.get('/itinerario/:idItinerario', vacanteController.getByItinerario);
router.post('/', vacanteController.crearVacante);

module.exports = router;
