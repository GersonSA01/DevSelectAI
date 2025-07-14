const db = require('../models');

exports.obtenerInformePostulante = async (req, res) => {
  const idPostulante = req.params.idPostulante;

  try {
    const postulante = await db.Postulante.findByPk(idPostulante, {
      include: [
        {
          model: db.DetalleHabilidad,
          as: 'habilidades',
          include: [{ model: db.Habilidad, as: 'habilidad' }]
        },
        {
          model: db.Evaluacion,
          as: 'evaluaciones',
          include: [
            {
              model: db.PreguntaEvaluacion,
              as: 'respuestas',
              include: [
                {
                  model: db.Pregunta,
                  as: 'pregunta',
                  include: [
                    { model: db.PreguntaTecnica, as: 'preguntaTecnica' },
                    { model: db.Opcion, as: 'opciones' }
                  ]
                }
              ]
            },
            { model: db.EntrevistaOral, as: 'entrevista' },
            { model: db.Capture, as: 'captures' }
          ]
        },
        {
          model: db.PostulanteVacante,
          as: 'selecciones',
          include: [
            {
              model: db.Vacante,
              as: 'vacante',
              include: [
                { model: db.Itinerario, as: 'itinerario' }
              ]
            }
          ]
        }
      ]
    });

    if (!postulante) return res.status(404).json({ error: 'Postulante no encontrado' });

    const evaluacion = postulante.evaluaciones[0];
    const entrevista = await db.EntrevistaOral.findByPk(evaluacion?.Id_Entrevista, {
      include: [{ model: db.PreguntaOral, as: 'preguntasOrales' }]
    });

   
    const habilidades = postulante.habilidades.map(h => h.habilidad.Descripcion);

    
    const tiemposOrales = entrevista?.preguntasOrales.map(p => p.TiempoRptaPostulante || 0) || [];
    const calificacionOral = entrevista?.preguntasOrales.reduce((acc, p) => acc + (p.CalificacionIA || 0), 0) || 0;

    
    const teoricas = evaluacion?.respuestas?.filter(r => !r.pregunta?.preguntaTecnica) || [];
    const tiempoTeorico = teoricas.reduce((acc, r) => acc + (r.TiempoRptaPostulante || 0), 0);
    const calificacionTeorico = teoricas.reduce((acc, r) => acc + (r.Puntaje || 0), 0);

    const preguntasTeoricas = teoricas.map(r => ({
      pregunta: r.pregunta?.Pregunta || '',
      respuesta: r.RptaPostulante,
      Puntaje: r.Puntaje || 0,
      TiempoRpta: r.TiempoRptaPostulante || 0
    }));

    
    const tecnica = evaluacion?.respuestas?.find(r => r.pregunta?.preguntaTecnica);
    const tiempoTecnica = tecnica?.TiempoRptaPostulante || 0;
    const calificacionTecnica = tecnica?.Puntaje || 0;

    const preguntaTecnica = tecnica
      ? {
          pregunta: tecnica.pregunta?.Pregunta || '',
          respuesta: tecnica.RptaPostulante,
          Puntaje: tecnica.Puntaje || 0,
          TiempoRpta: tecnica.TiempoRptaPostulante || 0,
          UsoIA: tecnica.UsoIA === 1
        }
      : null;

const capturas = (evaluacion?.captures || []).filter(c => c.Aprobado === true || c.Aprobado === 1);
const totalCapturas = capturas.length;
const capturasPenalizadas = capturas.filter(c => c.Aprobado === true || c.Aprobado === 1).length;


let puntajeCapturas = 2 - (capturasPenalizadas * 0.5);
if (puntajeCapturas < 0) puntajeCapturas = 0;

    
    const seleccion = postulante.selecciones?.[0];
    const vacante = seleccion?.vacante;
    const itinerarioDescripcion = vacante?.itinerario?.descripcion || 'No asignado';
    const vacanteDescripcion = vacante?.Descripcion || 'Sin descripción';

    const observacion = evaluacion?.ObservacionGeneral || '';

    
    const puntajeEvaluacion = calificacionOral + calificacionTeorico + calificacionTecnica;
    const puntajeFinal = puntajeEvaluacion + puntajeCapturas;

    
    await evaluacion.update({ PuntajeTotal: puntajeFinal });

    res.json({
      nombre: `${postulante.Nombre} ${postulante.Apellido}`,
      itinerario: itinerarioDescripcion,
      vacante: vacanteDescripcion,
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
        capturas: puntajeCapturas 
      },
      puntajeEvaluacion,
      puntajeFinal,
      preguntasTeoricas,
      preguntaTecnica,
      capturas,
      observacion
    });

  } catch (error) {
    console.error('Error en obtenerInformePostulante:', error);
    res.status(500).json({ error: 'Error al generar el informe' });
  }
};
