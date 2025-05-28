const express = require('express');
const router = express.Router();
const vacanteController = require('../controllers/vacanteController');

// GET /api/vacantes/itinerario/2
router.get('/itinerario/:idItinerario', vacanteController.getByItinerario);

module.exports = router;
