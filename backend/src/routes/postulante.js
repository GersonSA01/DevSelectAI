const express = require("express");
const router = express.Router();
const { crearPostulante, guardarHabilidades } = require("../controllers/postulanteController");

router.post("/", crearPostulante);
router.post("/habilidades", guardarHabilidades); // 👉 nueva ruta

module.exports = router;
