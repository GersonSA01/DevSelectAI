const express = require('express');
const router = express.Router();
const { getItinerarios } = require('../controllers/itinerarioController');
const auth = require("../../middlewares/auth");

router.get('/', auth("reclutador"), getItinerarios);

module.exports = router;
