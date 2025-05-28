// src/routes/postulante.js
const express = require('express');
const router = express.Router();
const postulanteController = require('../controllers/postulanteController');

router.post('/', postulanteController.crearPostulante);

module.exports = router;
