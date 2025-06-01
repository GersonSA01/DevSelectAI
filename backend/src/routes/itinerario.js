const express = require('express');
const router = express.Router();
const { getItinerarios } = require('../controllers/itinerarioController');

router.get('/', getItinerarios);

module.exports = router;
