const express = require("express");
const router = express.Router();
const { crearPostulante } = require("../controllers/postulanteController");

router.post("/", crearPostulante);

module.exports = router;
