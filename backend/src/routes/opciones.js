const express = require('express');
const router = express.Router();
const opcionesController = require('../controllers/opcionesController');

// Crear opción
router.post('/', opcionesController.create);

// Obtener opciones por pregunta
router.get('/pregunta/:idPregunta', opcionesController.getByPregunta);

// 🔥 Ruta faltante: Eliminar opciones por pregunta
router.delete('/pregunta/:idPregunta', opcionesController.deleteByPregunta);

module.exports = router;
