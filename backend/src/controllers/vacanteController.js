// controllers/vacanteController.js
const { Vacante, Empresa } = require('../models');

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
