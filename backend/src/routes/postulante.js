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
  getPreguntaTecnica,
  verificarPostulantePorCedula,
  verificarEstadoPostulacion,
  aprobar,
  rechazar
} = require("../controllers/postulanteController");
const postulanteController = require('../controllers/postulanteController');
router.get("/", getAllPostulantes);
router.post("/", crearPostulante);
router.post("/habilidades", guardarHabilidades);
router.get("/token/:token", obtenerPorToken);
router.post('/seleccionar-vacante', seleccionarVacante);
router.put('/:id/cambiar-estado', cambiarEstado);
router.get("/cedula/:cedula", verificarPostulantePorCedula);


// 🔹 Nuevas rutas para evaluación
router.get("/preguntas-teoricas", getPreguntasTeoricas);
router.get("/entrevista", getEntrevistaOral);
router.get("/preguntas-orales", getPreguntasOrales);
router.get("/pregunta-tecnica", getPreguntaTecnica);
router.get("/:id", obtenerPorId);
router.get('/estado/:id', verificarEstadoPostulacion);

router.put('/:id/aceptar', aprobar);
router.put('/:id/rechazar', rechazar);


module.exports = router;
