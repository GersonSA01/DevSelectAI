const express = require('express');
const router = express.Router();
const auth = require("../../middlewares/auth");
const {
  getVacantesPorHabilidades,
  getHabilidadesByVacante,
  getByItinerario,
  crearVacante,
  getById,
  actualizarVacante,
  eliminarVacante
} = require('../controllers/vacanteController');

//Publica
router.post('/por-habilidades', getVacantesPorHabilidades);
router.get('/:idVacante/habilidades', getHabilidadesByVacante);

//Privada
router.get('/itinerario/:idItinerario', auth("reclutador"), getByItinerario);
router.post('/', auth("reclutador"), crearVacante);
router.get('/:id', auth("reclutador"), getById);
router.put('/:id', auth("reclutador"), actualizarVacante);
router.delete('/:id', auth("reclutador"), eliminarVacante);

module.exports = router;
