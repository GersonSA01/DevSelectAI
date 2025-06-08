const express = require("express");
const router = express.Router();
const {
  crearPostulante,
  guardarHabilidades,
  obtenerPorToken,
  seleccionarVacante,
  getAllPostulantes // ⬅️ Agregado
} = require("../controllers/postulanteController");

router.get("/", getAllPostulantes); // ⬅️ Nueva ruta GET
router.post("/", crearPostulante);
router.post("/habilidades", guardarHabilidades);
router.get("/token/:token", obtenerPorToken);
router.post('/seleccionar-vacante', seleccionarVacante);

module.exports = router;
