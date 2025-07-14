const express = require('express');
const router = express.Router();
const vacanteController = require('../controllers/vacanteController');


router.post('/por-habilidades', vacanteController.getVacantesPorHabilidades);


router.get('/itinerario/:idItinerario', vacanteController.getByItinerario);


router.get('/:idVacante/habilidades', vacanteController.getHabilidadesByVacante);


router.post('/', vacanteController.crearVacante);


router.get('/:id', vacanteController.getById);
router.put('/:id', vacanteController.actualizarVacante);
router.delete('/:id', vacanteController.eliminarVacante);

module.exports = router;
