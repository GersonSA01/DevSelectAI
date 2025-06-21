const fs = require('fs');
const path = require('path');
const db = require('../models');

exports.crearCapture = async (req, res) => {
  const { id_Evaluacion, File, Aprobado, Observacion } = req.body;

  try {
    // Extraer base64 sin el prefijo
    const base64Data = File.replace(/^data:image\/jpeg;base64,/, '');
    const fileName = `captura_${id_Evaluacion}_${Date.now()}.jpg`;
    const filePath = path.join(__dirname, '..', 'uploads', fileName); // crea carpeta /uploads si no existe

    // Guardar archivo como imagen
    fs.writeFileSync(filePath, base64Data, 'base64');

    // Registrar solo la ruta relativa o nombre en la BD
    const nuevaCaptura = await db.Capture.create({
      id_Evaluacion,
      File: fileName, // o guarda `filePath` si prefieres ruta completa
      Aprobado,
      Observacion,
    });

    res.status(201).json(nuevaCaptura);
  } catch (error) {
    console.error('❌ Error al guardar captura:', error);
    res.status(500).json({ error: 'Error al guardar la captura' });
  }
};

exports.getCapturasPorPostulante = async (req, res) => {
  const idPostulante = parseInt(req.params.idPostulante);

  try {
    // Busca TODAS las evaluaciones del postulante
    const evaluaciones = await db.Evaluacion.findAll({
      where: { Id_postulante: idPostulante },
      attributes: ['id_Evaluacion'],
    });

    if (!evaluaciones || evaluaciones.length === 0) {
      return res.status(404).json({ error: 'No se encontró evaluación para este postulante' });
    }

    // Extraer los ID de las evaluaciones
    const idsEvaluacion = evaluaciones.map(e => e.id_Evaluacion);

    // Buscar capturas que coincidan con cualquier evaluación del postulante
    const capturas = await db.Capture.findAll({
      where: {
        id_Evaluacion: idsEvaluacion
      }
    });

    res.json(capturas);
  } catch (error) {
    console.error('❌ Error al obtener capturas:', error);
    res.status(500).json({ error: 'Error al obtener capturas' });
  }
};
