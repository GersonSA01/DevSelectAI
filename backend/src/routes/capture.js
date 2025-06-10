const express = require('express');
const router = express.Router();
const captureController = require('../controllers/captureController');

router.post('/', captureController.crearCapture);

module.exports = router;
