const db = require("../models");

const calificarEntrevistaOral = async (req, res) => {
  try {
    const { idEntrevista, calificaciones } = req.body;

    if (!idEntrevista || !Array.isArray(calificaciones) || calificaciones.length === 0) {
      return res.status(400).json({ error: "Datos incompletos o mal formateados." });
    }

    
    const entrevista = await db.EntrevistaOral.findByPk(idEntrevista, {
      include: [{ model: db.PreguntaOral, as: "preguntasOrales" }]
    });

    if (!entrevista) {
      return res.status(404).json({ error: "Entrevista no encontrada." });
    }

    let total = 0;

    for (const { idPregunta, calificacion } of calificaciones) {
      if (typeof idPregunta !== "number" || typeof calificacion !== "number") continue;

      const pregunta = await db.PreguntaOral.findByPk(idPregunta);

      if (!pregunta) {
        console.warn(`⚠️ Pregunta oral con ID ${idPregunta} no encontrada`);
        continue;
      }

      await pregunta.update({ CalificacionIA: calificacion });
      total += calificacion;

      console.log(`✅ Pregunta ${idPregunta} actualizada con nota ${calificacion}`);
    }

    await entrevista.update({
      RetroalimentacionIA: `Calificación manual: ${total}/6`,
    });

    return res.json({
      mensaje: "✅ Entrevista calificada correctamente",
      calificacionTotal: total,
    });

  } catch (error) {
    console.error("❌ Error al calificar entrevista oral:", error);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
};

const getEntrevistaOral = async (req, res) => {
  try {
    const { idEntrevista } = req.params;

    const entrevista = await db.EntrevistaOral.findByPk(idEntrevista, {
      include: [{ model: db.PreguntaOral, as: "preguntasOrales" }]
    });

    if (!entrevista) {
      return res.status(404).json({ error: "Entrevista no encontrada." });
    }

    const preguntas = entrevista.preguntasOrales.map((p) => ({
      idPregunta: p.Id_Pregunta_oral, 
      pregunta: p.PreguntaIA,
      respuesta: p.RespuestaPostulante,
      calificacion: p.CalificacionIA,
      ronda: p.Ronda,
      tiempo: p.TiempoRptaPostulante,
    }));

    return res.json({
      idEntrevista: entrevista.Id_Entrevista,
      retroalimentacion: entrevista.RetroalimentacionIA,
      preguntasOrales: preguntas,
    });
  } catch (error) {
    console.error("❌ Error al obtener entrevista oral:", error);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
};

const calificarTecnico = async (req, res) => {
  try {
    const { idEvaluacion, idPregunta, subCalificaciones } = req.body;
    if (
      typeof idEvaluacion !== "number" ||
      typeof idPregunta   !== "number" ||
      !subCalificaciones ||
      ["calidad","compila","resolucion","usoIA"]
        .some((k) => subCalificaciones[k] === undefined)
    ) {
      return res.status(400).json({ error: "Datos incompletos o mal formateados." });
    }

    
    const registro = await db.PreguntaEvaluacion.findOne({
      where: { id_Evaluacion: idEvaluacion, Id_Pregunta: idPregunta }
    });
    if (!registro) {
      return res.status(404).json({ error: "Registro PreguntaEvaluacion no encontrado." });
    }

    
    const sumaBruta =
      subCalificaciones.calidad +
      subCalificaciones.compila +
      subCalificaciones.resolucion;

    
    const usoIApayload = Boolean(subCalificaciones.usoIA);
    const ajuste = usoIApayload ? 0 : +1;

    
    let puntaje = sumaBruta + ajuste;
    puntaje     = Math.max(0, Math.min(7, puntaje));

    
    await registro.update({
      Puntaje: puntaje,
      UsoIA:   usoIApayload ? 1 : 0
    });

    return res.json({
      mensaje: "✅ Evaluación técnica guardada correctamente",
      puntaje
    });
  } catch (error) {
    console.error("❌ Error al calificar evaluación técnica:", error);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
};

const actualizarEvaluacionGeneral = async (req, res) => {
  try {
    const { idEvaluacion, ObservacionGeneral, PuntajeTotal } = req.body;

    
    if (typeof idEvaluacion !== "number") {
      return res.status(400).json({ error: "idEvaluacion inválido" });
    }

    
    const registro = await db.Evaluacion.findByPk(idEvaluacion);
    if (!registro) {
      return res.status(404).json({ error: "Evaluación no encontrada" });
    }

    
    await registro.update({
      ObservacionGeneral,
      PuntajeTotal,
    });

    
    const postulante = await db.Postulante.findByPk(registro.Id_postulante);
    if (postulante) {
      await postulante.update({ id_EstadoPostulacion: 5 });
    }

    return res.json({
      mensaje: "✅ Evaluación y estado del postulante actualizados",
      evaluacion: registro,
      postulanteActualizado: postulante,
    });

  } catch (error) {
    console.error("❌ Error guardando evaluación general:", error);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
};



module.exports = {
  calificarEntrevistaOral,
  getEntrevistaOral,
  calificarTecnico,
  actualizarEvaluacionGeneral
};
