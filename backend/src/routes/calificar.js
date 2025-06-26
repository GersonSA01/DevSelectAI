const express = require("express");
const router = express.Router();
const { calificarEntrevistaOral } = require("../controllers/calificarController");

router.put("/entrevista-oral", calificarEntrevistaOral);
// router.put("/teorico", calificarTeorico);
// router.put("/tecnica", calificarTecnico);
// router.put("/capturas", calificarCapturas);

module.exports = router;
