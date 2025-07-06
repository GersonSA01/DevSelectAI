const crypto = require("crypto");
const db = require('../models');
const sendEmail = require('../../utils/sendEmail');
require('dotenv').config();

const baseUrl = process.env.URL_FRONTEND || "http://localhost:3000";

// 👉 Crear postulante y enviar correo
const crearPostulante = async (req, res) => {
  const datos = req.body;

  try {
    const token = crypto.randomBytes(24).toString("hex");

    await db.Postulante.create({
      ...datos,
      token_entrevista: token
    });

    const nuevoPostulante = await db.Postulante.findOne({
      where: { Cedula: datos.Cedula }
    });

    if (!nuevoPostulante) throw new Error("No se pudo recuperar el postulante.");

    const textoItinerario = datos.Itinerario || datos.ItinerarioExcel || "";
    const match = textoItinerario.match(/\d+/);
    const numeroItinerario = match ? parseInt(match[0]) : null;

    if (numeroItinerario) {
      const itinerario = await db.Itinerario.findOne({
        where: {
          descripcion: { [db.Sequelize.Op.like]: `%Itinerario ${numeroItinerario}%` }
        }
      });

      if (itinerario) {
        await db.ItinerarioPostulante.create({
          Id_Postulante: nuevoPostulante.Id_Postulante,
          id_Itinerario: itinerario.id_Itinerario,
          Id_EstadoItinerario: 1,
          FechInicio: new Date(),
          FechFin: null
        });
      }
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto;">
        <div style="background-color: #0f172a; padding: 20px; text-align: center;">
          <h1 style="color: white;">DevSelectAI</h1>
        </div>
        <div style="padding: 30px;">
          <h2>🎓 Bienvenido/a a DevSelectAI</h2>
          <p>Has sido registrado exitosamente en nuestro sistema de entrevistas inteligentes para prácticas preprofesionales.</p>
        </div>
      </div>
    `;

    await sendEmail(nuevoPostulante.Correo, "✅ Registro exitoso - DevSelectAI", html);

    res.status(201).json({ mensaje: 'Postulante registrado y correo enviado.' });
  } catch (error) {
    console.error('❌ Error al crear postulante:', error);
    res.status(500).json({ error: 'Error al crear postulante' });
  }
};

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

const seleccionarVacante = async (req, res) => {
  const { idPostulante, idVacante } = req.body;

  if (!idPostulante || !idVacante) {
    return res.status(400).json({ error: 'Faltan datos requeridos.' });
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

    const vacante = await db.Vacante.findByPk(idVacante, {
      include: [{ model: db.ProgramacionPostulacion, as: 'programacionesPostulacion' }]
    });

    if (!vacante) return res.status(404).json({ error: 'Vacante no encontrada.' });

    const programacion = vacante.programacionesPostulacion[0];
    if (!programacion) return res.status(400).json({ error: 'Vacante sin programación.' });

    await db.PostulanteVacante.create({
      Id_Postulante: idPostulante,
      Id_Vacante: idVacante,
      id_ProgramacionPostulacion: programacion.id_ProgramacionPostulacion,
      FechaSeleccion: new Date()
    });

    const postulante = await db.Postulante.findByPk(idPostulante);

    const html = `
      <div style="font-family: Arial; max-width: 700px; margin: auto;">
        <div style="background-color: #0f172a; padding: 20px; text-align: center;">
          <h1 style="color: white;">DevSelectAI</h1>
        </div>
        <div style="padding: 20px;">
          <p>Hola ${postulante.Nombre} ${postulante.Apellido},</p>
          <p>¡Felicidades! Has sido asignado a la vacante: <strong>${vacante.Descripcion}</strong></p>
          <p><a href="${baseUrl}/postulador/entrevista/inicio?token=${postulante.token_entrevista}" 
          style="background: #0f172a; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
          🎤 Iniciar entrevista</a></p>
        </div>
      </div>
    `;

    await sendEmail(postulante.Correo, "📌 Vacante asignada - DevSelectAI", html);

    res.json({ message: 'Vacante asignada y correo enviado.' });
  } catch (error) {
    console.error('❌ Error al asignar vacante:', error);
    res.status(500).json({ error: 'Error interno.' });
  }
};

const verificarPostulantePorCedula = async (req, res) => {
  const { cedula } = req.params;

  try {
    const existente = await db.Postulante.findOne({ where: { Cedula: cedula } });
    if (existente) return res.json(existente);
    else return res.status(404).json(null);
  } catch (error) {
    console.error("❌ Error al verificar postulante:", error);
    return res.status(500).json({ error: "Error interno" });
  }
};

const getAllPostulantes = async (req, res) => {
  try {
    const postulantes = await db.Postulante.findAll({
      include: [
        { model: db.EstadoPostulacion, as: 'estadoPostulacion' },
        { model: db.DetalleHabilidad, as: 'habilidades', include: [{ model: db.Habilidad, as: 'habilidad' }] },
        { model: db.PostulanteVacante, as: 'selecciones', include: [{ model: db.Vacante, as: 'vacante' }] },
        { model: db.Evaluacion, as: 'evaluaciones' }
      ]
    });
    res.json(postulantes);
  } catch (error) {
    console.error('❌ Error al obtener postulantes:', error);
    res.status(500).json({ error: 'Error interno' });
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
    res.status(500).json({ error: "Error interno" });
  }
};

const cambiarEstado = async (req, res) => {
  const { id } = req.params;
  const { nuevoEstado } = req.body;

  try {
    const postulante = await db.Postulante.findByPk(id);
    if (!postulante) return res.status(404).json({ error: 'No encontrado' });

    postulante.id_EstadoPostulacion = nuevoEstado;
    await postulante.save();

    res.json({ mensaje: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error('❌ Error al actualizar estado:', error);
    res.status(500).json({ error: 'Error interno' });
  }
};

const verificarEstadoPostulacion = async (req, res) => {
  const idPostulante = req.params.id;

  try {
    const registro = await db.PostulanteVacante.findOne({
      where: { Id_Postulante: idPostulante },
      include: [
        {
          model: db.ProgramacionPostulacion,
          as: 'programacionPostulacion',
          include: [
            { model: db.Programacion, as: 'programacion' }
          ]
        }
      ]
    });

    if (!registro) {
      // No hay registro, puede continuar con el proceso
      return res.json({ estado: 'proceso' });
    }

    // Si ya tiene registro, ya no puede repetir
    const { FechIniAprobacion, FechFinAprobacion } = registro.programacionPostulacion.programacion;

    return res.json({
      estado: 'ya_asignado',
      mensaje: 'Ya completaste tus entrevistas y exámenes y tienes una vacante asignada. Por favor, revisa tu correo para más detalles.',
      fechas: {
        inicio: FechIniAprobacion,
        fin: FechFinAprobacion
      }
    });

  } catch (error) {
    console.error('❌ Error en verificarEstadoPostulacion:', error);
    res.status(500).json({ error: 'Error interno' });
  }
};

const getPreguntasTeoricas = async (req, res) => {
  const { id } = req.query;

  try {
    const respuestas = await db.PreguntaEvaluacion.findAll({
      include: [
        {
          model: db.Pregunta,
          as: 'pregunta',
          include: [
            {
              model: db.PreguntaTecnica,
              as: 'preguntaTecnica',
              required: false
            }
          ]
        },
        {
          model: db.Evaluacion,
          as: 'evaluacion',
          where: { Id_postulante: id }
        }
      ]
    });

    const teoricas = respuestas
      .filter(r => !r.pregunta?.preguntaTecnica)
      .map(r => ({
        pregunta: r.pregunta?.Pregunta || 'No encontrada',
        respuesta: r.RptaPostulante || 'Sin respuesta',
        puntaje: r.Puntaje || 0
      }));

    res.json(teoricas);
  } catch (err) {
    console.error('❌ Error en getPreguntasTeoricas:', err);
    res.status(500).json({ error: 'Error interno al obtener preguntas teóricas' });
  }
};

const getEntrevistaOral = async (req, res) => {
  try {
    const id = req.query.id;

    const evaluacion = await db.Evaluacion.findOne({ where: { Id_postulante: id } });

    if (!evaluacion) return res.status(404).json({ error: 'Evaluación no encontrada' });

    const entrevista = await db.EntrevistaOral.findOne({ where: { Id_Entrevista: evaluacion.Id_Entrevista } });

    res.json(entrevista);
  } catch (error) {
    console.error('Error en getEntrevistaOral:', error);
    res.status(500).json({ error: 'Error interno' });
  }
};

const getPreguntasOrales = async (req, res) => {
  try {
    const id = req.query.id;

    const evaluacion = await db.Evaluacion.findOne({ where: { Id_postulante: id } });
    if (!evaluacion) return res.status(404).json({ error: 'Evaluación no encontrada' });

    const entrevista = await db.EntrevistaOral.findOne({ where: { Id_Entrevista: evaluacion.Id_Entrevista } });

    const preguntas = await db.PreguntaOral.findAll({ where: { Id_Entrevista: evaluacion.Id_Entrevista } });

    const formateadas = preguntas.map(p => ({
      idPregunta: p.Id_Pregunta_oral,
      pregunta: p.PreguntaIA,
      respuesta: p.RespuestaPostulante,
      calificacion: p.CalificacionIA,
      ronda: p.Ronda,
      tiempo: p.TiempoRptaPostulante
    }));

    res.json({
      preguntas: formateadas,
      retroalimentacionIA: entrevista?.RetroalimentacionIA || null
    });
  } catch (error) {
    console.error('Error en getPreguntasOrales:', error);
    res.status(500).json({ error: 'Error interno' });
  }
};

const getPreguntaTecnica = async (req, res) => {
  try {
    const id = req.query.id;

    const evaluacion = await db.Evaluacion.findOne({
      where: { Id_postulante: id },
      include: { model: db.Pregunta, as: 'pregunta' }
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
      retroalimentacion: tecnica.ObservacionIA || '',
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
  verificarPostulantePorCedula,
  verificarEstadoPostulacion
};
