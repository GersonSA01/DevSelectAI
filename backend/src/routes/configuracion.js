const express = require('express');
const router = express.Router();
const controller = require('../controllers/configuracionController');
const auth = require("../../middlewares/auth");

router.get('/:entidad', auth(["postulante", "reclutador"]), controller.listar);
router.post('/:entidad', auth("reclutador"), controller.crear);
router.delete('/:entidad/:id', auth("reclutador"), controller.eliminar);
router.put('/:entidad/:id', auth("reclutador"), controller.actualizar);

module.exports = router;
