const { Opcion } = require("../models");

const opcionesController = {
  create: async (req, res) => {
    try {
      const nueva = await Opcion.create(req.body);
      res.status(201).json(nueva);
    } catch (err) {
      console.error("Error al crear opción:", err);
      res.status(500).json({ error: "Error al crear opción" });
    }
  },

  deleteByPregunta: async (req, res) => {
    try {
      const { idPregunta } = req.params;
      await Opcion.destroy({ where: { Id_Pregunta: idPregunta } });
      res.json({ message: "Opciones eliminadas correctamente" });
    } catch (error) {
      console.error("Error al eliminar opciones:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },

  getByPregunta: async (req, res) => {
    try {
      const { idPregunta } = req.params;
      const opciones = await Opcion.findAll({ where: { Id_Pregunta: idPregunta } });
      res.json(opciones);
    } catch (error) {
      console.error("Error al obtener opciones:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
};

module.exports = opcionesController;
