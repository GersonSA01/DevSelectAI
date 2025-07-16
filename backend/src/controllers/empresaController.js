const db = require('../models');

const empresaController = {
  getEmpresas: async (req, res) => {
    try {
      const empresas = await db.Empresa.findAll({
        where: { Activo: true }
      });
      res.json(empresas);
    } catch (err) {
      console.error('Error al obtener empresas:', err);
      res.status(500).json({ error: 'Error al obtener empresas' });
    }
  }
};


module.exports = empresaController;
