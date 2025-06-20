const express = require("express");
const router = express.Router();
const {
  crearPostulante,
  guardarHabilidades,
  obtenerPorToken,
  seleccionarVacante,
  getAllPostulantes,
  cambiarEstado,
  obtenerPorId,
  getPreguntasTeoricas,
  getEntrevistaOral,
  getPreguntasOrales,
  getPreguntaTecnica
} = require("../controllers/postulanteController");

router.get("/", getAllPostulantes);
router.post("/", crearPostulante);
router.post("/habilidades", guardarHabilidades);
router.get("/token/:token", obtenerPorToken);
router.post('/seleccionar-vacante', seleccionarVacante);
router.get("/:id", obtenerPorId);
router.put('/:id/cambiar-estado', cambiarEstado);

// 🔹 Nuevas rutas para evaluación
router.get("/preguntas-teoricas", getPreguntasTeoricas);
router.get("/entrevista", getEntrevistaOral);
router.get("/preguntas-orales", getPreguntasOrales);
router.get("/pregunta-tecnica", getPreguntaTecnica);

module.exports = router;
