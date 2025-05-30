const express = require('express');
const router = express.Router();
const empresaController = require('../controllers/empresaController');

router.get('/', empresaController.getEmpresas);

module.exports = router;
