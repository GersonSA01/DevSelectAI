
const express = require("express");
const router = express.Router();
const {
  calificarEntrevistaOral,
  getEntrevistaOral,
  calificarTecnico,
  actualizarEvaluacionGeneral,
} = require("../controllers/calificarController");
const auth = require("../../middlewares/auth");

router.use(auth("reclutador"));

router.put("/entrevista-oral", calificarEntrevistaOral);
router.get("/entrevista-oral/:idEntrevista", getEntrevistaOral);
router.put("/tecnica", calificarTecnico);  
router.put("/general", actualizarEvaluacionGeneral);

module.exports = router;
