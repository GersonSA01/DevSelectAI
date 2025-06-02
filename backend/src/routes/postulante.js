const express = require("express");
const router = express.Router();
const { crearPostulante, guardarHabilidades, obtenerPorToken } = require("../controllers/postulanteController");

router.post("/", crearPostulante);
router.post("/habilidades", guardarHabilidades);

// 🔥 NUEVA RUTA GET PARA CONSULTAR POSTULANTE POR TOKEN
router.get("/token/:token", obtenerPorToken);

module.exports = router;
