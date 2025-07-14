
const express = require('express');
const router = express.Router();
const preguntasController = require('../controllers/preguntasController');


router.get('/vacante/:idVacante', preguntasController.getPreguntasByVacante);

router.get('/:id', preguntasController.getPreguntaById);

router.post('/', preguntasController.createPregunta);

router.put('/:id', preguntasController.updatePregunta);

router.delete('/:id', preguntasController.deletePregunta);

router.get('/tecnica/vacante/:idVacante', preguntasController.getPreguntasTecnicasByVacante);

router.post('/tecnica', preguntasController.createPreguntaTecnica);

router.get('/tecnica/:idPregunta', preguntasController.getPreguntaTecnicaByPreguntaId);

router.put('/tecnica/:idPregunta', preguntasController.updatePreguntaTecnica);

router.get('/preguntas-teoricas', preguntasController.getPreguntasTeoricasPorPostulante);


module.exports = router;