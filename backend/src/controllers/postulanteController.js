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

    const nuevoPostulante = await db.Postulante.create({
      ...datos,
      token_entrevista: token
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
        <div style="background-color: #0f172a; padding: 20px;">
          <h1 style="color: white; text-align: center; margin: 0;">DevSelectAI</h1>
        </div>

        <p>¡Hola ${nuevoPostulante.nombres}!</p>

        <p>Tu registro ha sido exitoso. Ya puedes iniciar sesión para continuar con tu proceso.</p>

        <p style="margin: 20px 0;">
          👉 Inicia sesión aquí: 
          <a href="${baseUrl}/login" style="color: #0f172a;">${baseUrl}/login</a>
        </p>

        <p style="margin: 20px 0;">
          🎤 Cuando estés listo para iniciar la entrevista, accede al siguiente enlace único:<br>
          <a href="${baseUrl}/invitacion?token=${token}" style="color: #0f172a;">
            ${baseUrl}/invitacion?token=${token}
          </a>
        </p>

        <p>Si tienes algún inconveniente, no dudes en contactarnos.</p>

        <div style="background-color: #0f172a; color: white; text-align: center; font-size: 12px; padding: 10px; margin-top: 40px;">
          ¿Necesitas ayuda? Visita <a href="http://soporte.com" style="color: #93c5fd;">soporte.com</a>
        </div>
      </div>
    `;

    await sendEmail(nuevoPostulante.Correo, "✅ Registro exitoso - DevSelectAI", html);

    res.status(201).json({ mensaje: 'Postulante registrado y correo enviado con éxito.' });
  } catch (error) {
    console.error('Error al crear postulante:', error);
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

    res.json(postulante);
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



module.exports = {
  crearPostulante,
  guardarHabilidades,
  obtenerPorToken,
  seleccionarVacante,
  getAllPostulantes,
  obtenerPorId,
  cambiarEstado
};
