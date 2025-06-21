const db = require('../models');

exports.obtenerInformePostulante = async (req, res) => {
  const idPostulante = req.params.idPostulante;

  try {
    // 1. Buscar postulante con relaciones necesarias
    const postulante = await db.Postulante.findByPk(idPostulante, {
      include: [
        {
          model: db.DetalleHabilidad,
          as: 'habilidades',
          include: [
            { model: db.Habilidad, as: 'habilidad' }
          ]
        },
        {
          model: db.Evaluacion,
          as: 'evaluaciones',
          include: [
            {
              model: db.Pregunta,
              as: 'pregunta',
              include: [
                { model: db.PreguntaTecnica, as: 'preguntaTecnica' }
              ]
            },
            { model: db.EntrevistaOral, as: 'entrevista' },
            { model: db.Capture, as: 'captures' }
          ]
        }
      ]
    });

    if (!postulante) return res.status(404).json({ error: 'Postulante no encontrado' });

    // 2. Obtener la entrevista oral completa
    const entrevista = await db.EntrevistaOral.findByPk(
      postulante.evaluaciones[0]?.Id_Entrevista,
      {
        include: [
          { model: db.PreguntaOral, as: 'preguntasOrales' }
        ]
      }
    );

    // 3. Armar los datos
    const habilidades = postulante.habilidades.map(h => h.habilidad.Descripcion);

    const tiemposOrales = entrevista?.preguntasOrales.map(p => p.TiempoRptaPostulante || 0) || [0, 0, 0];
    const calificacionOral = entrevista?.preguntasOrales.reduce((acc, p) => acc + (p.CalificacionIA || 0), 0);

    const teoricas = postulante.evaluaciones.filter(e => e.pregunta && !e.pregunta.preguntaTecnica);
    const tecnica = postulante.evaluaciones.find(e => e.pregunta?.preguntaTecnica);

    const tiempoTeorico = teoricas.reduce((acc, e) => acc + (e.TiempoRptaPostulante || 0), 0);
    const calificacionTeorico = teoricas.reduce((acc, e) => acc + (e.Puntaje || 0), 0);

    const tiempoTecnica = tecnica?.TiempoRptaPostulante || 0;
    const calificacionTecnica = tecnica?.Puntaje || 0;

    const capturas = postulante.evaluaciones.flatMap(e => e.captures || []);
    const calificacionCapturas = capturas.filter(c => c.Aprobado).length;

    const observacion = postulante.evaluaciones[0]?.ObservacionGeneral || '';

    // 4. Enviar respuesta final
    res.json({
      nombre: `${postulante.Nombre} ${postulante.Apellido}`,
      itinerario: postulante.Itinerario,
      habilidades,
      tiempos: {
        entrevista: tiemposOrales,
        teorico: tiempoTeorico,
        tecnica: tiempoTecnica
      },
      calificaciones: {
        entrevista: calificacionOral,
        teorico: calificacionTeorico,
        tecnica: calificacionTecnica,
        capturas: calificacionCapturas
      },
      capturas,
      observacion
    });

  } catch (error) {
    console.error('Error en obtenerInformePostulante:', error);
    res.status(500).json({ error: 'Error al generar el informe' });
  }
};
