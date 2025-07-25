const fs = require('fs');
const path = require('path');
const db = require('../models');

exports.crearCapture = async (req, res) => {
  const { id_Evaluacion, File, Aprobado, Observacion } = req.body;

  try {
    if (!id_Evaluacion || !File) {
      return res.status(400).json({ error: 'id_Evaluacion y File son obligatorios' });
    }

    const evaluacion = await db.Evaluacion.findByPk(id_Evaluacion);

    if (!evaluacion) {
      return res.status(404).json({ error: 'La evaluación no existe' });
    }

    
    const base64Data = File.replace(/^data:image\/jpeg;base64,/, '');
    const fileName = `captura_${id_Evaluacion}_${Date.now()}.jpg`;
    const filePath = path.join(__dirname, '..', 'uploads', fileName);

   
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    
    fs.writeFileSync(filePath, base64Data, 'base64');

    const nuevaCaptura = await db.Capture.create({
      id_Evaluacion,
      File: fileName,
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
    
    const evaluaciones = await db.Evaluacion.findAll({
      where: { Id_postulante: idPostulante },
      attributes: ['id_Evaluacion'],
    });

    if (!evaluaciones || evaluaciones.length === 0) {
      return res.status(404).json({ error: 'No se encontró evaluación para este postulante' });
    }

    
    const idsEvaluacion = evaluaciones.map(e => e.id_Evaluacion);

    
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
exports.actualizarCaptura = async (req, res) => {
  const { id } = req.params;
  const { Aprobado, Observacion } = req.body;

  try {
    const captura = await db.Capture.findByPk(id);

    if (!captura) {
      return res.status(404).json({ error: 'Captura no encontrada' });
    }

    captura.Aprobado = Aprobado;
    captura.Observacion = Observacion;

    await captura.save();

    res.json({ mensaje: 'Captura actualizada correctamente', captura });
  } catch (error) {
    console.error('❌ Error actualizando captura:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};