const db = require('../models');

const nivelController = {
  getNiveles: async (req, res) => {
    try {
      const niveles = await db.Nivel.findAll();
      res.json(niveles);
    } catch (err) {
      console.error('Error al obtener niveles:', err);
      res.status(500).json({ error: 'Error al obtener niveles' });
    }
  }
};

module.exports = nivelController;
