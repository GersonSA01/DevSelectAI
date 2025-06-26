const db = require("../models");

// 🔴 Calificar entrevista oral completa
const calificarEntrevistaOral = async (req, res) => {
  try {
    const { idEntrevista, calificaciones } = req.body;

    if (!idEntrevista || !Array.isArray(calificaciones)) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    let total = 0;

    for (let i = 0; i < calificaciones.length; i++) {
      const { idPregunta, calificacion } = calificaciones[i];
      total += calificacion;

      await db.PreguntaOral.update(
        { CalificacionIA: calificacion },
        { where: { Id_Pregunta_oral: idPregunta, Id_Entrevista: idEntrevista } }
      );
    }

    // Actualiza también la evaluación si lo deseas (opcional)
    await db.EntrevistaOral.update(
      { RetroalimentacionIA: `Calificación manual: ${total}/6` },
      { where: { Id_Entrevista: idEntrevista } }
    );

    return res.json({ mensaje: "✅ Entrevista calificada correctamente", calificacionTotal: total });
  } catch (error) {
    console.error("❌ Error al calificar entrevista oral:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Aquí puedes añadir más: teórico, técnico, capturas...

module.exports = {
  calificarEntrevistaOral,
  // calificarTeorico,
  // calificarTecnico,
  // calificarCapturas
};
