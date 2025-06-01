const express = require('express');
const router = express.Router();
const db = require('../models');

router.post('/', async (req, res) => {
  try {
    const { Opcion, Correcta, Id_Pregunta } = req.body;
    const nueva = await db.Opcion.create({ Opcion, Correcta, Id_Pregunta });
    res.status(201).json(nueva);
  } catch (err) {
    console.error('Error al crear opción:', err);
    res.status(500).json({ error: 'Error al guardar la opción' });
  }
});

module.exports = router;
