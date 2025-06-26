const crypto = require("crypto");
const db = require('../models');
const sendEmail = require('../../utils/sendEmail');
require('dotenv').config();

const baseUrl = process.env.URL_FRONTEND || "http://localhost:3000";

// 👉 Crear postulante y enviar correo con link de entrevista
const crearPostulante = async (req, res) => {
  const datos = req.body;

  try {
    const token = crypto.randomBytes(24).toString("hex");

    // 👉 Crear postulante
   await db.Postulante.create({
  ...datos,
  token_entrevista: token
});

// Recuperar el postulante insertado (por ejemplo, con su cédula)
const nuevoPostulante = await db.Postulante.findOne({
  where: { Cedula: datos.Cedula }
});

if (!nuevoPostulante) {
  throw new Error("No se pudo recuperar el postulante después de crear.");
}


    console.log("✅ Postulante creado:", nuevoPostulante.toJSON());

    // 👉 Detectar número de itinerario (ej. de "Itinerario 2" o solo "2")
    const textoItinerario = datos.Itinerario || datos.ItinerarioExcel || "";
    const match = textoItinerario.match(/\d+/);
    const numeroItinerario = match ? parseInt(match[0]) : null;

    console.log("🔍 Texto de itinerario:", textoItinerario);
    console.log("🔢 Número detectado:", numeroItinerario);

    if (numeroItinerario) {
      // 👉 Buscar descripción que contenga "Itinerario X"
      const itinerario = await db.Itinerario.findOne({
        where: {
          descripcion: {
            [db.Sequelize.Op.like]: `%Itinerario ${numeroItinerario}%`
          }
        }
      });

      if (itinerario) {
        console.log("📌 Itinerario encontrado:", itinerario.toJSON());

        const relacion = await db.ItinerarioPostulante.create({
  Id_Postulante: nuevoPostulante.Id_Postulante,
  id_Itinerario: itinerario.id_Itinerario,
  Id_EstadoItinerario: 1,
  FechInicio: new Date(),
  FechFin: null
});


        console.log("✅ Relación ItinerarioPostulante creada:", relacion.toJSON());
      } else {
        console.warn(`⚠️ No se encontró un itinerario con número ${numeroItinerario}`);
      }
    } else {
      console.warn("⚠️ No se detectó número válido en el texto del itinerario.");
    }

    // 👉 Enviar correo
    const html = `
  <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
    <div style="background-color: #0f172a; padding: 20px; text-align: center; border-top-left-radius: 10px; border-top-right-radius: 10px;">
      <h1 style="color: white; margin: 0;">DevSelectAI</h1>
    </div>

    <div style="padding: 30px;">
      <h2 style="color: #0f172a;">🎓 Bienvenido/a a DevSelectAI</h2>
      <p>Hola</strong>,</p>
      <p>Has sido registrado exitosamente en nuestro sistema de entrevistas inteligentes para prácticas preprofesionales.</p>

      <p>Si tienes algún inconveniente para acceder, por favor contacta con soporte.</p>
    </div>

    <div style="background-color: #0f172a; color: white; text-align: center; font-size: 12px; padding: 15px; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">
      ¿Necesitas ayuda? Visita <a href="http://soporte.com" style="color: #93c5fd;">soporte.com</a> o escribe a <a href="mailto:devselectai@gmail.com" style="color: #93c5fd;">devselectai@gmail.com</a>
    </div>
  </div>
`;

    await sendEmail(nuevoPostulante.Correo, "✅ Registro exitoso - DevSelectAI", html);

    res.status(201).json({ mensaje: 'Postulante registrado y correo enviado con éxito.' });
  } catch (error) {
    console.error('❌ Error al crear postulante:', error);
    res.status(500).json({ error: 'Error al crear postulante' });
  }
};



// 👉 Guardar hasta 3 habilidades seleccionadas por el postulante
const guardarHabilidades = async (req, res) => {
  const { idPostulante, habilidades } = req.body;

  if (!idPostulante || !Array.isArray(habilidades) || habilidades.length > 3) {
    return res.status(400).json({ error: 'Debes seleccionar de 1 a 3 habilidades' });
  }

  try {
    await db.DetalleHabilidad.destroy({ where: { Id_Postulante: idPostulante } });

    for (const idHabilidad of habilidades) {
      await db.DetalleHabilidad.create({
        Id_Postulante: idPostulante,
        Id_Habilidad: idHabilidad
      });
    }

    res.json({ mensaje: 'Habilidades guardadas correctamente.' });
  } catch (error) {
    console.error('Error al guardar habilidades:', error);
    res.status(500).json({ error: 'Error interno al guardar habilidades' });
  }
};

// 👉 Buscar postulante por token (para entrevista)
const obtenerPorToken = async (req, res) => {
const { token } = req.params;

  try {
    const postulante = await db.Postulante.findOne({
      where: { token_entrevista: token }
    });

    if (!postulante) {
      return res.status(404).json({ error: 'Token inválido o datos no encontrados.' });
    }

    res.json(postulante);
  } catch (error) {
    console.error('Error al obtener postulante por token:', error);
    res.status(500).json({ error: 'Error al buscar el postulante.' });
  }
};

// 👉 Asignar vacante a postulante y enviar correo con botón de entrevista
const seleccionarVacante = async (req, res) => {
  const { idPostulante, idVacante } = req.body;

  if (!idPostulante || !idVacante) {
    return res.status(400).json({ error: 'Faltan datos requeridos: idPostulante o idVacante' });
  }

  try {
    const existente = await db.PostulanteVacante.findOne({
      where: { Id_Postulante: idPostulante }
    });

    if (existente) {
      return res.status(400).json({
        error: 'El postulante ya tiene una vacante asignada.',
        existente
      });
    }

    await db.PostulanteVacante.create({
      Id_Postulante: idPostulante,
      Id_Vacante: idVacante,
      FechaSeleccion: new Date()
    });

    const postulante = await db.Postulante.findByPk(idPostulante);
    const vacante = await db.Vacante.findByPk(idVacante);

    const habilidades = await db.DetalleHabilidad.findAll({
      where: { Id_Postulante: idPostulante },
      include: [{ model: db.Habilidad, as: 'habilidad' }]
    });

    const habilidadesTexto = habilidades.map(h => `• ${h.habilidad.Descripcion}`).join('<br>');

    if (!postulante || !vacante) {
      return res.status(404).json({ error: 'Datos de postulante o vacante no encontrados.' });
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; border: 1px solid #ddd;">
        <div style="background-color: #0f172a; padding: 20px;">
          <h1 style="color: white; text-align: center;">DevSelectAI</h1>
        </div>

        <div style="padding: 20px;">
          <p>Hola ${postulante.Nombre} ${postulante.Apellido},</p>
          <p>¡Felicidades! Has sido asignado a la vacante:</p>
          <p><strong>${vacante.Descripcion}</strong></p>
          <p>${vacante.Contexto}</p>

          <p><strong>✅ Tus habilidades seleccionadas:</strong><br>${habilidadesTexto}</p>

         <p style="margin-top: 30px; text-align: center;">
  <a href="${baseUrl}/postulador/entrevista/inicio?token=${postulante.token_entrevista}"
     style="background-color: #0f172a; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
     🎤 Iniciar entrevista
  </a>
</p>


          <p style="margin-top: 20px;">Revisa tu panel para continuar con el proceso.</p>
        </div>

        <div style="background-color: #0f172a; color: white; text-align: center; font-size: 12px; padding: 10px;">
          ¿Tienes dudas? Visítanos en <a href="http://soporte.com" style="color: #93c5fd;">soporte.com</a>
        </div>
      </div>
    `;

    await sendEmail(postulante.Correo, "📌 Vacante asignada - DevSelectAI", html);

    res.status(200).json({ message: 'Vacante asignada y correo enviado.' });
  } catch (error) {
    console.error('❌ Error al asignar vacante:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const verificarPostulantePorCedula = async (req, res) => {
  const { cedula } = req.params;

  try {
    const existente = await db.Postulante.findOne({
      where: { Cedula: cedula }
    });

    if (existente) {
      return res.status(200).json(existente); // Existe
    } else {
      return res.status(404).json(null); // No existe
    }
  } catch (error) {
    console.error("❌ Error al verificar postulante:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};


const getAllPostulantes = async (req, res) => {
  try {
    const postulantes = await db.Postulante.findAll({
      include: [
        {
          model: db.EstadoPostulacion,
          as: 'estadoPostulacion', // 👈 Usa este alias
          attributes: ['descripcion']
        },
        {
          model: db.DetalleHabilidad,
          as: 'habilidades',
          include: [{ model: db.Habilidad, as: 'habilidad' }]
        },
        {
          model: db.PostulanteVacante,
          as: 'selecciones',
          include: [{ model: db.Vacante, as: 'vacante' }]
        }
      ]
    });

    res.json(postulantes);
  } catch (error) {
    console.error('❌ Error al obtener postulantes:', error);
    res.status(500).json({ error: 'Error al obtener postulantes' });
  }
};


const obtenerPorId = async (req, res) => {
  const id = req.params.id;

  try {
    const postulante = await db.Postulante.findByPk(id);

    if (!postulante) {
      return res.status(404).json({ error: "Postulante no encontrado" });
    }

    const relacion = await db.ItinerarioPostulante.findOne({
      where: { Id_Postulante: id },
      include: [
        { model: db.Itinerario, as: 'itinerario' },
        { model: db.Estadoltinerario, as: 'estado' }
      ]
    });

    res.json({
      ...postulante.toJSON(),
      Itinerario: relacion?.itinerario?.descripcion || null,
      EstadoItinerario: relacion?.estado?.Descripcion || null,
      FechInicio: relacion?.FechInicio || null,
      FechFin: relacion?.FechFin || null
    });
  } catch (error) {
    console.error("❌ Error al obtener postulante por ID:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};


// 👉 Cambiar estado de postulación (ej. Evaluado)
const cambiarEstado = async (req, res) => {
  const { id } = req.params;
  const { nuevoEstado } = req.body;

  try {
    const postulante = await db.Postulante.findByPk(id);
    if (!postulante) {
      return res.status(404).json({ error: 'Postulante no encontrado' });
    }

    postulante.id_EstadoPostulacion = nuevoEstado;
    await postulante.save();

    res.json({ mensaje: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error('❌ Error al actualizar estado del postulante:', error);
    res.status(500).json({ error: 'Error al cambiar estado del postulante' });
  }
};



// 🔹 Obtener preguntas teóricas respondidas por el postulante
const getPreguntasTeoricas = async (req, res) => {
  const { id } = req.query;

  try {
    const evaluaciones = await db.Evaluacion.findAll({
      where: { Id_Postulante: id },
      include: [
        {
          model: db.Pregunta,
          as: 'pregunta',
          include: [
            {
              model: db.PreguntaTecnica,
              as: 'preguntaTecnica',
              required: false // Esto es clave: LEFT JOIN
            }
          ]
        }
      ]
    });

    // Solo dejar preguntas sin técnica
    const teoricas = evaluaciones
      .filter(ev => !ev.pregunta?.preguntaTecnica)
      .map(ev => ({
        pregunta: ev.pregunta?.Pregunta || 'No encontrada',
        respuesta: ev.RptaPostulante || 'Sin respuesta',
        Puntaje: ev.Puntaje || 0,
      }));

    res.json(teoricas);
  } catch (err) {
    console.error('❌ Error en getPreguntasTeoricas:', err);
    res.status(500).json({ error: 'Error interno al obtener preguntas teóricas' });
  }
};




// 🔹 Obtener resumen de entrevista oral (veredicto + retroalimentación IA)
const getEntrevistaOral = async (req, res) => {
  try {
    const id = req.query.id;

    const evaluacion = await db.Evaluacion.findOne({
      where: { Id_postulante: id }
    });

    if (!evaluacion) return res.status(404).json({ error: 'Evaluación no encontrada' });

    const entrevista = await db.EntrevistaOral.findOne({
      where: { Id_Entrevista: evaluacion.Id_Entrevista }
    });

    res.json(entrevista);
  } catch (error) {
    console.error('Error en getEntrevistaOral:', error);
    res.status(500).json({ error: 'Error interno' });
  }
};

const getPreguntasOrales = async (req, res) => {
  try {
    const id = req.query.id;

    const evaluacion = await db.Evaluacion.findOne({
      where: { Id_postulante: id }
    });

    if (!evaluacion) return res.status(404).json({ error: 'Evaluación no encontrada' });

    // 🔹 Obtener entrevista oral asociada
    const entrevista = await db.EntrevistaOral.findOne({
      where: { Id_Entrevista: evaluacion.Id_Entrevista }
    });

    const preguntas = await db.PreguntaOral.findAll({
      where: { Id_Entrevista: evaluacion.Id_Entrevista }
    });

    const formateadas = preguntas.map(p => ({
      pregunta: p.PreguntaIA,
      respuesta: p.RespuestaPostulante,
      calificacion: p.CalificacionIA,
      ronda: p.Ronda,
      tiempo: p.TiempoRptaPostulante
    }));

    // 🔹 Agregar retroalimentación como parte de la respuesta
    res.json({
      preguntas: formateadas,
      retroalimentacionIA: entrevista?.RetroalimentacionIA || null
    });
  } catch (error) {
    console.error('Error en getPreguntasOrales:', error);
    res.status(500).json({ error: 'Error interno' });
  }
};


// 🔹 Obtener pregunta técnica (evaluación práctica)
const getPreguntaTecnica = async (req, res) => {
  try {
    const id = req.query.id;

    const evaluacion = await db.Evaluacion.findOne({
      where: { Id_postulante: id },
      include: {
        model: db.Pregunta,
        as: 'pregunta'
      }
    });

    if (!evaluacion || !evaluacion.Id_pregunta) {
      return res.status(404).json({ error: 'Pregunta técnica no encontrada' });
    }

    const tecnica = await db.PreguntaTecnica.findOne({
      where: { Id_Pregunta: evaluacion.Id_pregunta }
    });

    if (!tecnica) return res.status(404).json({ error: 'Pregunta técnica no registrada' });

    res.json({
      pregunta: evaluacion.pregunta?.Pregunta,
      respuesta: tecnica.Respuesta,
      usoIA: tecnica.UsoIA,
      retroalimentacion: tecnica.ObservacionIA || '', // si existe
      calificacion: evaluacion.Puntaje
    });
  } catch (error) {
    console.error('Error en getPreguntaTecnica:', error);
    res.status(500).json({ error: 'Error interno' });
  }
};


module.exports = {
  crearPostulante,
  guardarHabilidades,
  obtenerPorToken,
  seleccionarVacante,
  getAllPostulantes,
  obtenerPorId,
  cambiarEstado,
  getPreguntasTeoricas,
  getEntrevistaOral,
  getPreguntasOrales,
  getPreguntaTecnica,
  verificarPostulantePorCedula 
};
