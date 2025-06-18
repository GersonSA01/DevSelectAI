const express = require('express');
const router = express.Router();
const { getAllCiudades } = require('../controllers/ciudadController');

router.get('/', getAllCiudades);

module.exports = router;