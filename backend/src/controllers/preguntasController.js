const { Pregunta, Opcion, PreguntaTecnica, Habilidad, Evaluacion, PostulanteVacante } = require('../models');

const preguntasController = {
  // ✅ Obtener preguntas teóricas respondidas por postulante
  getPreguntasTeoricasPorPostulante: async (req, res) => {
    const { id } = req.query;

    try {
      // 1. Buscar vacante asignada al postulante
      const relacion = await PostulanteVacante.findOne({
        where: { Id_Postulante: id }
      });

      if (!relacion) {
        return res.status(404).json({ error: 'No se encontró vacante asignada para el postulante.' });
      }

      const idVacante = relacion.Id_Vacante;

      // 2. Traer preguntas teóricas, sus opciones, habilidad y respuesta del postulante
      const preguntas = await Pregunta.findAll({
        where: {
          Id_vacante: idVacante,
          Id_TipoPregunta: 1 // 1 = opción múltiple
        },
        include: [
          { model: Habilidad },
          { model: Opcion, as: 'opciones' },
          {
            model: Evaluacion,
            where: { Id_Postulante: id },
            required: false
          }
        ],
        order: [['Id_Pregunta', 'ASC']]
      });

      const resultado = preguntas.map(p => {
        const evaluacion = p.Evaluacions?.[0];
        const opcionSeleccionada = p.opciones?.find(o => o.Id_Opcion === evaluacion?.Id_OpcionSeleccionada);

        return {
          pregunta: p.Pregunta,
          habilidad: p.Habilidad?.Descripcion || '',
          respuesta: opcionSeleccionada?.Descripcion || 'No respondida',
          correcta: opcionSeleccionada?.EsCorrecta || false
        };
      });

      res.json(resultado);
    } catch (error) {
      console.error('❌ Error en getPreguntasTeoricasPorPostulante:', error);
      res.status(500).json({ error: 'Error interno del servidor', message: error.message });
    }
  },

  // Obtener preguntas por vacante
  getPreguntasByVacante: async (req, res) => {
    try {
      const { idVacante } = req.params;

      const preguntas = await Pregunta.findAll({
        where: { Id_vacante: idVacante },
        include: [
          { model: Opcion, as: 'opciones' },
          { model: PreguntaTecnica, as: 'preguntaTecnica' }
        ],
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

  // Obtener pregunta técnica por ID
  getPreguntaTecnicaByPreguntaId: async (req, res) => {
    try {
      const { idPregunta } = req.params;

      const tecnica = await PreguntaTecnica.findOne({
        where: { Id_Pregunta: idPregunta }
      });

      if (!tecnica) {
        return res.status(404).json({ error: 'Pregunta técnica no encontrada' });
      }

      res.json(tecnica);
    } catch (error) {
      console.error('Error al obtener la pregunta técnica:', error);
      res.status(500).json({ error: 'Error al obtener la pregunta técnica' });
    }
  },

  // Crear pregunta técnica
  createPreguntaTecnica: async (req, res) => {
    try {
      const { Respuesta, UsoIA, Id_Pregunta } = req.body;

      const nueva = await PreguntaTecnica.create({
        Respuesta,
        UsoIA,
        Id_Pregunta
      });

      res.status(201).json(nueva);
    } catch (error) {
      console.error('Error al crear pregunta técnica:', error);
      res.status(500).json({ error: 'Error al crear pregunta técnica' });
    }
  },

  // Actualizar pregunta técnica
  updatePreguntaTecnica: async (req, res) => {
    try {
      const { idPregunta } = req.params;
      const { Respuesta, UsoIA } = req.body;

      const tecnica = await PreguntaTecnica.findOne({ where: { Id_Pregunta: idPregunta } });

      if (!tecnica) {
        return res.status(404).json({ error: 'Pregunta técnica no encontrada' });
      }

      await tecnica.update({ Respuesta, UsoIA });

      res.json(tecnica);
    } catch (error) {
      console.error('Error al actualizar pregunta técnica:', error);
      res.status(500).json({ error: 'Error al actualizar pregunta técnica' });
    }
  },

  // Obtener preguntas técnicas por vacante
  getPreguntasTecnicasByVacante: async (req, res) => {
    try {
      const { idVacante } = req.params;

      const preguntas = await PreguntaTecnica.findAll({
        include: {
          model: Pregunta,
          where: { Id_vacante: idVacante }
        }
      });

      res.json(preguntas);
    } catch (error) {
      console.error('Error al obtener preguntas técnicas:', error);
      res.status(500).json({ error: 'Error al obtener preguntas técnicas' });
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

  // Obtener una pregunta por ID
  getPreguntaById: async (req, res) => {
    try {
      const { id } = req.params;
      const pregunta = await Pregunta.findByPk(id);

      if (!pregunta) {
        return res.status(404).json({ error: 'Pregunta no encontrada' });
      }

      res.json(pregunta);
    } catch (error) {
      console.error('Error al obtener la pregunta:', error);
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
