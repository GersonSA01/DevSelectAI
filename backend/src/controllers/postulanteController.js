const db = require('../models');

const crearPostulante = async (req, res) => {
  const datos = req.body;

  try {
    const nuevoPostulante = await db.Postulante.create(datos);
    res.status(201).json(nuevoPostulante);
  } catch (error) {
    console.error('Error al crear postulante:', error);
    res.status(500).json({ error: 'Error al crear postulante' });
  }
};

const guardarHabilidades = async (req, res) => {
  const { idPostulante, habilidades } = req.body;

  if (!idPostulante || !Array.isArray(habilidades) || habilidades.length > 3) {
    return res.status(400).json({ error: 'Debes seleccionar de 1 a 3 habilidades' });
  }

  try {
    // (Opcional) Elimina habilidades anteriores si existe alguna
    await db.DetalleHabilidad.destroy({ where: { Id_Postulante: idPostulante } });

    // Guarda habilidades usando ID directamente
    for (const idHabilidad of habilidades) {
      await db.DetalleHabilidad.create({
        Id_Postulante: idPostulante,
        Id_Habilidad: idHabilidad
      });
    }

    res.json({ mensaje: 'Habilidades guardadas correctamente' });
  } catch (error) {
    console.error('Error al guardar habilidades:', error);
    res.status(500).json({ error: 'Error interno al guardar habilidades' });
  }
};

module.exports = {
  crearPostulante,
  guardarHabilidades
};
