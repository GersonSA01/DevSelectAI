// controllers/preguntasController.js
const { Pregunta } = require('../models');

const preguntasController = {
  // Obtener preguntas por vacante
  getPreguntasByVacante: async (req, res) => {
    try {
      const { idVacante } = req.params;
      
      const preguntas = await Pregunta.findAll({
        where: { Id_vacante: idVacante },
        order: [['Id_Pregunta', 'ASC']]
      });

      res.json(preguntas);
    } catch (error) {
      console.error('Error al obtener preguntas:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: error.message 
      });
    }
  },

  // Crear nueva pregunta
  createPregunta: async (req, res) => {
    try {
      const { Pregunta: preguntaTexto, RptaPregunta, Id_vacante, Id_TipoPregunta } = req.body;
      
      const nuevaPregunta = await Pregunta.create({
        FechCreacion: new Date(),
        Pregunta: preguntaTexto,
        RptaPregunta,
        Id_vacante,
        Id_TipoPregunta
      });

      res.status(201).json(nuevaPregunta);
    } catch (error) {
      console.error('Error al crear pregunta:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: error.message 
      });
    }
  },

  // Actualizar pregunta
  updatePregunta: async (req, res) => {
    try {
      const { id } = req.params;
      const { Pregunta: preguntaTexto, RptaPregunta, Id_TipoPregunta } = req.body;
      
      const pregunta = await Pregunta.findByPk(id);
      if (!pregunta) {
        return res.status(404).json({ error: 'Pregunta no encontrada' });
      }

      await pregunta.update({
        Pregunta: preguntaTexto,
        RptaPregunta,
        Id_TipoPregunta
      });

      res.json(pregunta);
    } catch (error) {
      console.error('Error al actualizar pregunta:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: error.message 
      });
    }
  },

  // Eliminar pregunta
  deletePregunta: async (req, res) => {
    try {
      const { id } = req.params;
      
      const pregunta = await Pregunta.findByPk(id);
      if (!pregunta) {
        return res.status(404).json({ error: 'Pregunta no encontrada' });
      }

      await pregunta.destroy();
      res.json({ message: 'Pregunta eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar pregunta:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: error.message 
      });
    }
  }
};

module.exports = preguntasController;