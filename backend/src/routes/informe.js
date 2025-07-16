const express = require('express');
const router = express.Router();
const auth = require("../../middlewares/auth");
const {obtenerInformePostulante} = require('../controllers/informeController');

router.get('/:idPostulante', auth("reclutador"), obtenerInformePostulante);

module.exports = router;
