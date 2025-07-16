const express = require('express');
const router = express.Router();
const { Habilidad } = require('../models');

router.get('/', async (req, res) => {
  try {
    const habilidades = await Habilidad.findAll({
      where: { Activo: true }
    });
    res.json(habilidades);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener habilidades' });
  }
});

module.exports = router;
