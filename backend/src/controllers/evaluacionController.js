const db = require('../models');
const { Op } = require('sequelize');
const { OpenAI } = require("openai");

exports.crearEvaluacionInicial = async (req, res) => {
  try {
    const idPostulante = parseInt(req.params.idPostulante);
    console.log('▶️ ID Postulante recibido:', idPostulante);

    
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


    const evaluacionesPrevias = await db.Evaluacion.findAll({
      where: { Id_postulante: idPostulante },
      include: {
        model: db.PreguntaEvaluacion,
        as: 'respuestas', 
        include: {
          model: db.Pregunta,
          as: 'pregunta',
          include: {
            model: db.Vacante,
            as: 'vacante',
            where: { id_Itinerario: itinerarioVacante }
          }
        }
      }
    });


    if (evaluacionesPrevias.length > 0) {
      return res.status(409).json({ error: 'Ya existe una evaluación para este itinerario' });
    }

    
    const preguntasTeoricas = await db.Pregunta.findAll({
      where: { Id_vacante: idVacante },
      include: [{ model: db.Opcion, as: 'opciones', required: true }],
      order: db.sequelize.random(),
      limit: 5
    });

    
    const preguntasTecnicas = await db.Pregunta.findAll({
      where: { Id_vacante: idVacante },
      include: [{ model: db.PreguntaTecnica, as: 'preguntaTecnica', required: true }]
    });

    const preguntaTecnica = preguntasTecnicas.length > 0
      ? preguntasTecnicas[Math.floor(Math.random() * preguntasTecnicas.length)]
      : null;

    console.log('📋 Preguntas teóricas:', preguntasTeoricas.map(p => p.Id_Pregunta));
    console.log('🧠 Pregunta técnica:', preguntaTecnica?.Id_Pregunta || 'Ninguna');

    
    const entrevista = await db.EntrevistaOral.create({ RetroalimentacionIA: null });

    
    const evaluacion = await db.Evaluacion.create({
      Id_postulante: idPostulante,
      Id_Entrevista: entrevista.Id_Entrevista,
      PuntajeTotal: 0,
      ObservacionGeneral: '',
      RptaPostulante: ''
    });

    
    const insertadas = [];

    for (const pregunta of preguntasTeoricas) {
      try {
        const insert = await db.PreguntaEvaluacion.create({
          id_Evaluacion: evaluacion.id_Evaluacion,
          Id_Pregunta: pregunta.Id_Pregunta,
          UsoIA: 0,
          TiempoRptaPostulante: 0,
          RptaPostulante: '',
          Puntaje: 0
        });
        insertadas.push(insert);
        console.log(`✅ Insertada pregunta teórica ${pregunta.Id_Pregunta}`);
      } catch (err) {
        console.error(`❌ Error al insertar pregunta teórica ${pregunta.Id_Pregunta}:`, err.message);
      }
    }

    
    if (preguntaTecnica) {
      try {
        const insert = await db.PreguntaEvaluacion.create({
          id_Evaluacion: evaluacion.id_Evaluacion,
          Id_Pregunta: preguntaTecnica.Id_Pregunta,
          UsoIA: 0,
          TiempoRptaPostulante: 0,
          RptaPostulante: '',
          Puntaje: 0
        });
        insertadas.push(insert);
        console.log(`✅ Insertada pregunta técnica ${preguntaTecnica.Id_Pregunta}`);
      } catch (err) {
        console.error(`❌ Error al insertar pregunta técnica ${preguntaTecnica.Id_Pregunta}:`, err.message);
      }
    }

    res.json({
      message: '✅ Evaluación y entrevista creadas exitosamente',
      evaluacionId: evaluacion.id_Evaluacion,
      preguntasInsertadas: insertadas.map(p => p.Id_Pregunta)
    });

  } catch (error) {
    console.error('❌ Error al crear evaluación inicial:', error.message);
    res.status(500).json({ error: error.message });
  }
};


exports.obtenerEvaluacionTeorica = async (req, res) => {
  try {
    const idPostulante = parseInt(req.params.idPostulante);

    
    const evaluacion = await db.Evaluacion.findOne({
      where: { Id_postulante: idPostulante },
    });

    if (!evaluacion) {
      return res.status(404).json({ error: 'Evaluación no encontrada.' });
    }

    
    const preguntasEvaluacion = await db.PreguntaEvaluacion.findAll({
      where: { id_Evaluacion: evaluacion.id_Evaluacion },
      include: {
        model: db.Pregunta,
        as: 'pregunta',
        include: [{ model: db.Opcion, as: 'opciones' }]
      }
    });

    const teoricas = preguntasEvaluacion.filter(pe => pe.pregunta?.opciones?.length > 0);

    const resultado = teoricas.map(pe => ({
      Id_Pregunta: pe.Id_Pregunta,
      Id_PreguntaEvaluacion: pe.id_PreguntaEvaluacion,
      Id_Evaluacion: pe.id_Evaluacion, 
      Pregunta: pe.pregunta.Pregunta,
      opciones: pe.pregunta.opciones.map(o => ({
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
    const { idOpcionSeleccionada, idPregunta, tiempo } = req.body;

    if (!idEvaluacion || !idOpcionSeleccionada || !idPregunta) {
      return res.status(400).json({ error: 'Faltan datos obligatorios.' });
    }

    
    const evaluacion = await db.Evaluacion.findByPk(idEvaluacion);
    if (!evaluacion) {
      return res.status(404).json({ error: 'Evaluación no encontrada.' });
    }

    
    const opcion = await db.Opcion.findByPk(idOpcionSeleccionada);
    if (!opcion) {
      return res.status(400).json({ error: 'Opción seleccionada inválida.' });
    }

    
    const [actualizado] = await db.PreguntaEvaluacion.update(
      {
        RptaPostulante: opcion.Opcion,
        Puntaje: opcion.Correcta ? 1 : 0,
        TiempoRptaPostulante: tiempo || 0
      },
      {
        where: {
          id_Evaluacion: idEvaluacion,
          Id_Pregunta: idPregunta
        }
      }
    );

    if (!actualizado) {
      await db.PreguntaEvaluacion.create({
        id_Evaluacion: idEvaluacion,
        Id_Pregunta: idPregunta,
        RptaPostulante: opcion.Opcion,
        Puntaje: opcion.Correcta ? 1 : 0,
        TiempoRptaPostulante: tiempo || 0,
        UsoIA: 0
      });
    }

    
    await db.PreguntaEvaluacion.update(
      { TiempoRptaPostulante: tiempo || 0 },
      {
        where: {
          id_Evaluacion: idEvaluacion,
          TiempoRptaPostulante: 0
        }
      }
    );

    return res.json({
      mensaje: '✅ Tiempo actualizado en todas las preguntas.',
      idPregunta,
      tiempo: tiempo || 0
    });

  } catch (error) {
    console.error('❌ Error al registrar respuesta:', error.message);
    return res.status(500).json({ error: 'Error al guardar la respuesta.' });
  }
};



exports.obtenerPreguntaTecnicaAsignada = async (req, res) => {
  try {
    const idPostulante = parseInt(req.params.idPostulante, 10);

    
    const evaluacion = await db.Evaluacion.findOne({
      where: { Id_postulante: idPostulante },
      include: {
        model: db.PreguntaEvaluacion,
        as: 'respuestas',
        include: {
          model: db.Pregunta,
          as: 'pregunta',
          include: {
            model: db.PreguntaTecnica,
            as: 'preguntaTecnica'
          }
        }
      }
    });

    if (!evaluacion) {
      return res.status(404).json({ error: 'Evaluación no encontrada.' });
    }

    
    const respuestaTecnica = evaluacion.respuestas.find(
      r => r.pregunta?.preguntaTecnica
    );

    if (!respuestaTecnica) {
      return res.status(404).json({ error: 'No se encontró pregunta técnica asignada.' });
    }

    
    res.json({
      Id_Evaluacion: evaluacion.id_Evaluacion,
      Id_Pregunta: respuestaTecnica.Id_Pregunta,
      pregunta: respuestaTecnica.pregunta.Pregunta,
      respuesta: respuestaTecnica.RptaPostulante || '',
      usoIA: respuestaTecnica.UsoIA  
    });
  } catch (error) {
    console.error('❌ Error al obtener pregunta técnica:', error);
    res.status(500).json({ error: 'Error interno al obtener la pregunta técnica.' });
  }
};



exports.guardarRespuestaTecnica = async (req, res) => {
  try {
    const { idPostulante, idPregunta, respuesta, tiempo } = req.body;

    if (!idPostulante || !idPregunta || !respuesta) {
      return res.status(400).json({ error: 'Faltan datos obligatorios.' });
    }

    const evaluacion = await db.Evaluacion.findOne({
      where: { Id_postulante: idPostulante }
    });

    if (!evaluacion) {
      return res.status(404).json({ error: 'Evaluación no encontrada.' });
    }

    const registro = await db.PreguntaEvaluacion.findOne({
      where: {
        id_Evaluacion: evaluacion.id_Evaluacion,
        Id_Pregunta: idPregunta
      }
    });

    if (!registro) {
      return res.status(404).json({ error: 'Relación Evaluación-Pregunta no encontrada.' });
    }

    await registro.update({
      RptaPostulante: respuesta,
      Puntaje: null,
      TiempoRptaPostulante: tiempo ?? null
    });

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

    const evaluacion = await db.Evaluacion.findOne({
      where: { Id_postulante: idPostulante },
      include: {
        model: db.PreguntaEvaluacion,
        as: 'respuestas',
        include: {
          model: db.Pregunta,
          as: 'pregunta',
          include: {
            model: db.PreguntaTecnica,
            as: 'preguntaTecnica'
          }
        }
      }
    });

    if (!evaluacion) {
      return res.status(404).json({ error: 'Evaluación no encontrada.' });
    }

    // Buscar la pregunta técnica entre las respuestas
    const respuestaTecnica = evaluacion.respuestas.find(
      r => r.pregunta?.preguntaTecnica
    );

    if (!respuestaTecnica) {
      return res.status(404).json({ error: 'No se encontró pregunta técnica asignada.' });
    }

    if (respuestaTecnica.UsoIA === 1) {
      return res.status(400).json({ error: 'Ya se ha solicitado ayuda de IA para esta pregunta.' });
    }

    const prompt = `Actúa como un entrevistador técnico. El postulante está resolviendo una pregunta de programación. Tu tarea es **dar solo una pista breve**, como una idea clave, una orientación general o una sugerencia inicial. No expliques la solución completa, no muestres código detallado ni reveles la lógica completa.
    ❌ No des la solución.
    ❌ No expliques cómo resolverlo paso a paso.
    ❌ No incluyas código funcional completo.
    ✅ Solo ofrece una orientación conceptual que pueda ayudarle a pensar mejor. 
    Aquí está la pregunta:

Pregunta:
${respuestaTecnica.pregunta.Pregunta}`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4',
      temperature: 0.6
    });

    const sugerencia = completion.choices[0].message.content;

    // ✅ Marcar la ayuda como utilizada tanto en PreguntaEvaluacion como en PreguntaTecnica
    await Promise.all([
      db.PreguntaEvaluacion.update(
        { UsoIA: 1 },
        { where: { id_PreguntaEvaluacion: respuestaTecnica.id_PreguntaEvaluacion } }
      ),
      db.PreguntaTecnica.update(
        { UsoIA: true },
        { where: { Id_Pregunta: respuestaTecnica.pregunta.Id_Pregunta } }
      )
    ]);

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




