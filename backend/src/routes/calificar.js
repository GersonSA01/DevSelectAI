// routes/calificacion.js
const express = require("express");
const router = express.Router();
const {
  calificarEntrevistaOral,
  getEntrevistaOral,
  calificarTecnico,
  actualizarEvaluacionGeneral,
} = require("../controllers/calificarController");

router.put("/entrevista-oral", calificarEntrevistaOral);
router.get("/entrevista-oral/:idEntrevista", getEntrevistaOral);
router.put("/tecnica", calificarTecnico);  // ← Nueva ruta
router.put("/general", actualizarEvaluacionGeneral);

module.exports = router;
