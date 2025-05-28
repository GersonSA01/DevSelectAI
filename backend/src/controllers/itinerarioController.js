const { Itinerario } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const itinerarios = await Itinerario.findAll();
    res.json(itinerarios);
  } catch (error) {
    console.error('Error al obtener itinerarios:', error);
    res.status(500).json({ error: 'Error al obtener itinerarios' });
  }
};
