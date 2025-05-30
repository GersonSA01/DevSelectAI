const express = require("express");
const router = express.Router();
const { crearReclutador } = require("../controllers/reclutadorController");

router.post("/", crearReclutador);

module.exports = router;
