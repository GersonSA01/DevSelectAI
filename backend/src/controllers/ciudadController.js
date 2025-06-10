const db = require('../models');

const getAllCiudades = async (req, res) => {
  try {
    const ciudades = await db.Ciudad.findAll();
    res.json(ciudades);
  } catch (error) {
    console.error('❌ Error al obtener ciudades:', error);
    res.status(500).json({ error: 'Error al obtener ciudades' });
  }
};

module.exports = { getAllCiudades };