const express = require('express');
const router = express.Router();
const itinerarioController = require('../controllers/itinerarioController');

// Ruta para obtener todos los itinerarios
router.get('/', itinerarioController.getAll);

module.exports = router;
