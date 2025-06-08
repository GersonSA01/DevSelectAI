const db = require('../models');

const getItinerarios = async (req, res) => {
  try {
    const itinerarios = await db.Itinerario.findAll();
    res.json(itinerarios);
  } catch (error) {
    console.error('Error al obtener itinerarios:', error);
    res.status(500).json({ error: 'Error al obtener itinerarios' });
  }
};

module.exports = { getItinerarios };
