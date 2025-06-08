const db = require('../models');
const { Sequelize } = require('sequelize');
const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); // asegúrate de tener esta variable en `.env`

exports.generarEvaluacion = async (req, res) => {
  try {
    const idPostulante = parseInt(req.params.idPostulante);

    const seleccion = await db.PostulanteVacante.findOne({
      where: { Id_Postulante: idPostulante }
    });

    if (!seleccion) {
      return res.status(404).json({ error: 'Vacante no asignada al postulante' });
    }

    const idVacante = seleccion.Id_Vacante;

    const evaluacionesExistentes = await db.Evaluacion.findAll({
      where: { Id_postulante: idPostulante },
      include: {
        model: db.Pregunta,
        as: 'pregunta',
        include: [{ model: db.Opcion, as: 'opciones' }]
      }
    });

    if (evaluacionesExistentes.length > 0) {
      const resultado = evaluacionesExistentes.map(ev => ({
        Id_Evaluacion: ev.id_Evaluacion,
        Id_Pregunta: ev.Id_pregunta,
        Pregunta: ev.pregunta.Pregunta,
        opciones: ev.pregunta.opciones?.map(o => ({
          Id_Opcion: o.Id_Opcion,
          Opcion: o.Opcion
        })) || []
      }));
      return res.json(resultado);
    }

    const preguntas = await db.Pregunta.findAll({
      where: { Id_vacante: idVacante },
      include: [{ model: db.Opcion, as: 'opciones', required: true }],
      order: db.sequelize.random(),
      limit: 5
    });

    const evaluaciones = [];

    for (const pregunta of preguntas) {
      const evaluacion = await db.Evaluacion.create({
        Id_postulante: idPostulante,
        Id_pregunta: pregunta.Id_Pregunta,
        RptaPostulante: null,
        Puntaje: null,
        ObservacionGeneral: null
      });

      evaluaciones.push({
        Id_Evaluacion: evaluacion.id_Evaluacion,
        Id_Pregunta: pregunta.Id_Pregunta,
        Pregunta: pregunta.Pregunta,
        opciones: pregunta.opciones.map(o => ({
          Id_Opcion: o.Id_Opcion,
          Opcion: o.Opcion
        }))
      });
    }

    const idsPreguntasTeoricas = preguntas.map(p => p.Id_Pregunta);

    const preguntaTecnica = await db.Pregunta.findOne({
      where: {
        Id_vacante: idVacante,
        Id_Pregunta: { [Sequelize.Op.notIn]: idsPreguntasTeoricas }
      },
      include: [{ model: db.PreguntaTecnica, as: 'preguntaTecnica', required: true }]
    });

    if (preguntaTecnica && preguntaTecnica.preguntaTecnica) {
      const evaluacionTecnica = await db.Evaluacion.create({
        Id_postulante: idPostulante,
        Id_pregunta: preguntaTecnica.Id_Pregunta,
        RptaPostulante: null,
        Puntaje: null,
        ObservacionGeneral: null
      });

      evaluaciones.push({
        Id_Evaluacion: evaluacionTecnica.id_Evaluacion,
        Id_Pregunta: preguntaTecnica.Id_Pregunta,
        Pregunta: preguntaTecnica.Pregunta,
        opciones: []
      });
    }

    res.json(evaluaciones);
  } catch (error) {
    console.error('❌ Error al generar evaluación teórica:', error);
    res.status(500).json({ error: 'Error interno al generar evaluación' });
  }
};

exports.responderPregunta = async (req, res) => {
  try {
    const idEvaluacion = parseInt(req.params.idEvaluacion);
    const { idOpcionSeleccionada } = req.body;

    const opcion = await db.Opcion.findByPk(idOpcionSeleccionada);
    if (!opcion) return res.status(400).json({ error: 'Opción inválida' });

    await db.Evaluacion.update(
      {
        RptaPostulante: opcion.Opcion,
        Puntaje: opcion.Correcta ? 1 : 0
      },
      {
        where: { id_Evaluacion: idEvaluacion }
      }
    );

    res.json({ mensaje: 'Respuesta registrada correctamente' });
  } catch (error) {
    console.error('❌ Error al registrar respuesta:', error);
    res.status(500).json({ error: 'Error al guardar respuesta' });
  }
};

exports.obtenerPreguntaTecnicaAsignada = async (req, res) => {
  try {
    const idPostulante = parseInt(req.params.idPostulante);

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
      return res.status(404).json({ error: 'No se encontró una pregunta técnica asignada' });
    }

    res.json({
      Id_Evaluacion: evaluacion.id_Evaluacion,
      Id_Pregunta: evaluacion.Id_pregunta,
      Pregunta: evaluacion.pregunta.Pregunta,
      ejemplo1: evaluacion.pregunta.preguntaTecnica.Ejemplo1 || null,
      ejemplo2: evaluacion.pregunta.preguntaTecnica.Ejemplo2 || null
    });
  } catch (error) {
    console.error('❌ Error al obtener pregunta técnica:', error);
    res.status(500).json({ error: 'Error interno al obtener la pregunta técnica' });
  }
};

exports.pedirAyudaIA = async (req, res) => {
  try {
    const { idPostulante } = req.body;

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
