const db = require('../models');

exports.obtenerInformePostulante = async (req, res) => {
  const idPostulante = req.params.idPostulante;

  try {
    // 1. Buscar postulante con relaciones
    const postulante = await db.Postulante.findByPk(idPostulante, {
      include: [
        { model: db.DetalleHabilidad, as: 'habilidades', include: ['habilidad'] },
        { model: db.Evaluacion, as: 'evaluaciones', include: ['pregunta', 'entrevista', 'captures'] }
      ]
    });

    if (!postulante) return res.status(404).json({ error: 'Postulante no encontrado' });

    const entrevista = await db.EntrevistaOral.findByPk(
      postulante.evaluaciones[0]?.Id_Entrevista,
      {
        include: [{ model: db.PreguntaOral, as: 'preguntasOrales' }]
      }
    );

    // 2. Armar los datos necesarios
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

    // 3. Enviar respuesta
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
