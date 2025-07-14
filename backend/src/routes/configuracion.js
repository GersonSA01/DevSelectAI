const express = require('express');
const router = express.Router();
const controller = require('../controllers/configuracionController');


router.get('/:entidad', controller.listar);
router.post('/:entidad', controller.crear);
router.delete('/:entidad/:id', controller.eliminar);
router.put('/:entidad/:id', controller.actualizar);

module.exports = router;
