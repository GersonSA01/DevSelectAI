const db = require('../models');
const { Op } = require('sequelize');
const { OpenAI } = require("openai");

exports.crearEvaluacionInicial = async (req, res) => {
  try {
    const idPostulante = parseInt(req.params.idPostulante);
    console.log('▶️ ID Postulante recibido:', idPostulante);

    // Buscar la vacante y su itinerario
    const relacion = await db.PostulanteVacante.findOne({
      where: { Id_Postulante: idPostulante },
      include: {
        model: db.Vacante,
        as: 'vacante',
        attributes: ['id_Itinerario']
      }
    });

    if (!relacion) {
      return res.status(404).json({ error: 'No se ha asignado una vacante al postulante' });
    }

    const idVacante = relacion.Id_Vacante;
    const itinerarioVacante = relacion.vacante.id_Itinerario;
    console.log('✅ Vacante:', idVacante, '| Itinerario:', itinerarioVacante);

    // Verificar si ya tiene evaluaciones de ese mismo itinerario
    const evaluacionesPrevias = await db.Evaluacion.findAll({
      where: { Id_postulante: idPostulante },
      include: {
        model: db.Pregunta,
        as: 'pregunta',
        include: {
          model: db.Vacante,
          as: 'vacante',
          where: { id_Itinerario: itinerarioVacante }
        }
      }
    });

    if (evaluacionesPrevias.length > 0) {
      console.warn('⛔ Evaluación ya existe para este itinerario');
      return res.status(409).json({ error: 'Ya existe una evaluación para este itinerario' });
    }

    // Obtener preguntas teóricas
    const preguntasTeoricas = await db.Pregunta.findAll({
      where: { Id_vacante: idVacante },
      include: [{ model: db.Opcion, as: 'opciones', required: true }],
      limit: 5
    });

    // Obtener una pregunta técnica
    const preguntaTecnica = await db.Pregunta.findOne({
      where: { Id_vacante: idVacante },
      include: [{ model: db.PreguntaTecnica, as: 'preguntaTecnica', required: true }]
    });

    // Crear entrevista oral
    const entrevista = await db.EntrevistaOral.create({
      RetroalimentacionIA: null
    });

    // Crear evaluaciones teóricas
    for (const pregunta of preguntasTeoricas) {
      await db.Evaluacion.create({
        Id_postulante: idPostulante,
        Id_pregunta: pregunta.Id_Pregunta,
        Id_Entrevista: entrevista.Id_Entrevista
      });
    }

    // Crear evaluación técnica
    if (preguntaTecnica) {
      await db.Evaluacion.create({
        Id_postulante: idPostulante,
        Id_pregunta: preguntaTecnica.Id_Pregunta,
        Id_Entrevista: entrevista.Id_Entrevista
      });
    }

    res.json({ message: 'Evaluación y entrevista creadas exitosamente' });

  } catch (error) {
    console.error('❌ Error al generar evaluación:', error.message);
    res.status(500).json({ error: error.message });
  }
};


exports.obtenerEvaluacionTeorica = async (req, res) => {
  try {
    const idPostulante = parseInt(req.params.idPostulante);

    const evaluaciones = await db.Evaluacion.findAll({
      where: { Id_postulante: idPostulante },
      include: {
        model: db.Pregunta,
        as: 'pregunta',
        include: [{ model: db.Opcion, as: 'opciones' }]
      }
    });

    const teoricas = evaluaciones.filter(ev => ev.pregunta?.opciones?.length > 0);

    const resultado = teoricas.map(ev => ({
      Id_Evaluacion: ev.id_Evaluacion,
      Id_Pregunta: ev.Id_pregunta,
      Pregunta: ev.pregunta.Pregunta,
      opciones: ev.pregunta.opciones.map(o => ({
        Id_Opcion: o.Id_Opcion,
        Opcion: o.Opcion
      }))
    }));

    res.json(resultado);
  } catch (error) {
    console.error('❌ Error al obtener evaluación teórica:', error.message);
    res.status(500).json({ error: 'Error al obtener preguntas teóricas.' });
  }
};


exports.responderPregunta = async (req, res) => {
  try {
    const idEvaluacion = parseInt(req.params.idEvaluacion);
    const { idOpcionSeleccionada } = req.body;

    if (!idEvaluacion || !idOpcionSeleccionada) {
      return res.status(400).json({ error: 'Faltan datos obligatorios.' });
    }

    // Verifica que la evaluación exista
    const evaluacion = await db.Evaluacion.findByPk(idEvaluacion);
    if (!evaluacion) {
      return res.status(404).json({ error: 'Evaluación no encontrada.' });
    }

    // Verifica que la opción exista
    const opcion = await db.Opcion.findByPk(idOpcionSeleccionada);
    if (!opcion) {
      return res.status(400).json({ error: 'Opción seleccionada inválida.' });
    }

    // Actualiza la evaluación con la respuesta del postulante
    await db.Evaluacion.update(
      {
        RptaPostulante: opcion.Opcion,
        Puntaje: opcion.Correcta ? 1 : 0
      },
      { where: { id_Evaluacion: idEvaluacion } }
    );

    return res.json({
      mensaje: '✅ Respuesta registrada correctamente.',
      RptaPostulante: opcion.Opcion,
      Puntaje: opcion.Correcta ? 1 : 0
    });

  } catch (error) {
    console.error('❌ Error al registrar respuesta:', error.message);
    return res.status(500).json({ error: 'Error al guardar la respuesta.' });
  }
};




exports.obtenerPreguntaTecnicaAsignada = async (req, res) => {
  try {
    const idPostulante = parseInt(req.params.idPostulante);

    const evaluaciones = await db.Evaluacion.findAll({
      where: { Id_postulante: idPostulante },
      include: {
        model: db.Pregunta,
        as: 'pregunta',
        required: true,
        include: [{
          model: db.PreguntaTecnica,
          as: 'preguntaTecnica',
          required: true
        }]
      }
    });

    const evaluacionTecnica = evaluaciones.find(ev => ev.pregunta?.preguntaTecnica);

    if (!evaluacionTecnica) {
      return res.status(404).json({ error: 'No se encontró una pregunta técnica asignada' });
    }

    res.json({
    Id_Evaluacion: evaluacionTecnica.id_Evaluacion,
    Id_Pregunta: evaluacionTecnica.Id_pregunta,
    pregunta: evaluacionTecnica.pregunta.Pregunta,
    respuesta: evaluacionTecnica.RptaPostulante || '',
    usoIA: evaluacionTecnica.pregunta.preguntaTecnica.UsoIA || false,
    ejemplo1: evaluacionTecnica.pregunta.preguntaTecnica.Ejemplo1 || null,
    ejemplo2: evaluacionTecnica.pregunta.preguntaTecnica.Ejemplo2 || null
  });

  } catch (error) {
    console.error('❌ Error al obtener pregunta técnica:', error);
    res.status(500).json({ error: 'Error interno al obtener la pregunta técnica' });
  }
};


exports.guardarRespuestaTecnica = async (req, res) => {
  try {
    const { idPostulante, idPregunta, respuesta } = req.body;

    if (!idPostulante || !idPregunta || !respuesta) {
      return res.status(400).json({ error: 'Faltan datos obligatorios.' });
    }

    const evaluacion = await db.Evaluacion.findOne({
      where: {
        Id_postulante: idPostulante,
        Id_pregunta: idPregunta
      }
    });

    if (!evaluacion) {
      return res.status(404).json({ error: 'Evaluación técnica no encontrada.' });
    }

    await db.Evaluacion.update(
      {
        RptaPostulante: respuesta,
        Puntaje: null // Se califica luego
      },
      {
        where: { id_Evaluacion: evaluacion.id_Evaluacion }
      }
    );

    res.json({ mensaje: '✅ Respuesta técnica guardada correctamente.' });
  } catch (error) {
    console.error('❌ Error al guardar respuesta técnica:', error);
    res.status(500).json({ error: 'Error al guardar la respuesta técnica.' });
  }
};





const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.pedirAyudaIA = async (req, res) => {
  try {
    const { idPostulante } = req.body;

    if (!idPostulante) {
      return res.status(400).json({ error: 'ID del postulante no proporcionado' });
    }

    // Buscar evaluación técnica
    const evaluacion = await db.Evaluacion.findOne({
      where: { Id_postulante: idPostulante },
      include: {
        model: db.Pregunta,
        as: 'pregunta',
        required: true,
        include: [{
          model: db.PreguntaTecnica,
          as: 'preguntaTecnica',
          required: true
        }]
      }
    });

    if (!evaluacion || !evaluacion.pregunta?.preguntaTecnica) {
      return res.status(404).json({ error: 'Pregunta técnica no encontrada para el postulante' });
    }

    if (evaluacion.pregunta.preguntaTecnica.UsoIA) {
      return res.status(400).json({ error: 'La ayuda de IA ya fue utilizada para esta pregunta.' });
    }

    const prompt = `Eres un entrevistador técnico. Da al postulante una pista muy breve y útil: una idea clave, una línea de código orientativa o un enfoque inicial. Sé amable y no reveles la solución.

Pregunta:
${evaluacion.pregunta.Pregunta}`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4',
      temperature: 0.6
    });

    const sugerencia = completion.choices[0].message.content;

    // Marcar la pregunta como ya asistida por IA
    await db.PreguntaTecnica.update(
      { UsoIA: true },
      { where: { Id_Pregunta: evaluacion.pregunta.Id_Pregunta } }
    );

    res.json({ sugerencia });
  } catch (error) {
    console.error('❌ Error al pedir ayuda IA:', error);
    res.status(500).json({ error: 'Error interno al solicitar ayuda' });
  }
};




exports.obtenerCapturasPorPostulante = async (req, res) => {
  try {
    const idPostulante = parseInt(req.params.idPostulante);

    // Obtener todas las evaluaciones del postulante
    const evaluaciones = await db.Evaluacion.findAll({
      where: { Id_postulante: idPostulante },
      attributes: ['id_Evaluacion'],
    });

    const idsEvaluaciones = evaluaciones.map(ev => ev.id_Evaluacion);

    // Buscar capturas asociadas
    const capturas = await db.Capture.findAll({
      where: { id_Evaluacion: idsEvaluaciones },
    });

    res.json(capturas);
  } catch (error) {
    console.error('❌ Error al obtener capturas:', error);
    res.status(500).json({ error: 'Error al obtener capturas del postulante.' });
  }
};




