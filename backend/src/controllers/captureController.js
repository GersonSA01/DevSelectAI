const db = require('../models');

exports.crearCapture = async (req, res) => {
  const { id_Evaluacion, File, Aprobado, Observacion } = req.body;

  try {
    const nuevaCaptura = await db.Capture.create({
      id_Evaluacion,
      File,
      Aprobado,
      Observacion
    });

    res.status(201).json(nuevaCaptura);
  } catch (error) {
    console.error('❌ Error al guardar captura:', error);
    res.status(500).json({ error: 'Error al guardar la captura' });
  }
};
