const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");

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

// 🔷 Rutas públicas
router.post("/", crearPostulante);
router.get("/token/:token", obtenerPorToken);
router.get("/cedula/:cedula", verificarPostulantePorCedula);
router.get("/entrevista", getEntrevistaOral);
router.get("/preguntas-teoricas",  getPreguntasTeoricas);
router.get("/preguntas-orales",  getPreguntasOrales);
router.put('/:id/cambiar-estado',  cambiarEstado);

// 🔷 Rutas para RECLUTADOR
router.get("/", auth("reclutador"), getAllPostulantes);
router.get("/:id", auth(["postulante", "reclutador"]), obtenerPorId);
router.put('/:id/aceptar', auth("reclutador"), aprobar);
router.put('/:id/rechazar', auth("reclutador"), rechazar);

// 🔷 Rutas para POSTULANTE
router.post("/habilidades", auth("postulante"), guardarHabilidades);
router.post('/seleccionar-vacante', auth("postulante"), seleccionarVacante);
router.get("/pregunta-tecnica", auth("postulante"), getPreguntaTecnica);
router.get('/estado/:id', auth("postulante"), verificarEstadoPostulacion);

module.exports = router;
