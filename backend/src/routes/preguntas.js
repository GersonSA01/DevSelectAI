const express = require('express');
const router = express.Router();
const preguntasController = require('../controllers/preguntasController');
const auth = require('../../middlewares/auth');


//  Rutas para reclutador
router.use(auth("reclutador"));

// preguntas teóricas
router.get('/preguntas-teoricas', preguntasController.getPreguntasTeoricasPorPostulante);
router.get('/vacante/:idVacante', preguntasController.getPreguntasByVacante);
router.get('/:id', preguntasController.getPreguntaById);
router.post('/', preguntasController.createPregunta);
router.put('/:id', preguntasController.updatePregunta);
router.delete('/:id', preguntasController.deletePregunta);

// preguntas técnicas
router.get('/tecnica/vacante/:idVacante', preguntasController.getPreguntasTecnicasByVacante);
router.post('/tecnica', preguntasController.createPreguntaTecnica);
router.get('/tecnica/:idPregunta', preguntasController.getPreguntaTecnicaByPreguntaId);
router.put('/tecnica/:idPregunta', preguntasController.updatePreguntaTecnica);

module.exports = router;
