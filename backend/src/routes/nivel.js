const express = require('express');
const router = express.Router();
const nivelController = require('../controllers/nivelController');

router.get('/', nivelController.getNiveles);

module.exports = router;
