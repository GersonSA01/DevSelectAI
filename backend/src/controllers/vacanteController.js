// controllers/vacanteController.js
const { Vacante, VacanteHabilidad, Empresa, Habilidad } = require('../models');

exports.getByItinerario = async (req, res) => {
  const { idItinerario } = req.params;

  try {
    const vacantes = await Vacante.findAll({
      where: { id_Itinerario: idItinerario },
      include: [{ model: Empresa, as: 'Empresa' }]
    });

    res.json(vacantes); // siempre un array
  } catch (error) {
    console.error('Error al obtener vacantes:', error);
    res.status(500).json({ error: 'Error al obtener vacantes' });
  }
};


exports.crearVacante = async (req, res) => {
  try {
    const {
      Id_Itinerario,
      Descripcion,
      Cantidad,
      Contexto,
      Id_reclutador,
      Id_Empresa,
      id_nivel,
      habilidades // Este campo debe ser un array de Id_Habilidad
    } = req.body;

    const nuevaVacante = await Vacante.create({
      id_Itinerario: Id_Itinerario,
      Descripcion,
      Cantidad,
      Contexto,
      Id_reclutador,
      Id_Empresa,
      id_nivel,
      CantidadUsoIA: 0
    });

    // Asociar las habilidades
    if (Array.isArray(habilidades) && habilidades.length > 0) {
      const vacanteHabilidades = habilidades.slice(0, 3).map(id => ({
        Id_Vacante: nuevaVacante.Id_Vacante,
        Id_Habilidad: id
      }));

      await VacanteHabilidad.bulkCreate(vacanteHabilidades);
    }

    res.status(201).json({ message: 'Vacante creada con habilidades' });
  } catch (error) {
    console.error('Error al crear vacante:', error);
    res.status(500).json({ error: 'Error al crear la vacante' });
  }
};

