const crypto = require("crypto");
const db = require('../models');
const sendEmail = require('../../utils/sendEmail'); // Ajusta la ruta según tu estructura real
require('dotenv').config();
const baseUrl = process.env.URL_FRONTEND || "http://localhost:3000";

const crearPostulante = async (req, res) => {
  const datos = req.body;

  try {
    // Generar token único
    const token = crypto.randomBytes(24).toString("hex");

    // Crear el postulante incluyendo el token
    const nuevoPostulante = await db.Postulante.create({
      ...datos,
      token_entrevista: token
    });

    // Construir HTML del correo de confirmación de registro
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
        <div style="background-color: #0f172a; padding: 20px;">
          <h1 style="color: white; text-align: center; margin: 0;">DevSelectAI</h1>
        </div>

        <p>¡Hola ${nuevoPostulante.nombres}!</p>

        <p>Tu registro ha sido exitoso. Ya puedes iniciar sesión para continuar con tu proceso.</p>

        <p style="margin: 20px 0;">
          👉 Inicia sesión aquí: 
          <a href="${baseUrl}/login"  style="color: #0f172a;">
            http://localhost:3000/login
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

const guardarHabilidades = async (req, res) => {
  const { idPostulante, habilidades } = req.body;

  if (!idPostulante || !Array.isArray(habilidades) || habilidades.length > 3) {
    return res.status(400).json({ error: 'Debes seleccionar de 1 a 3 habilidades' });
  }

  try {
    // Eliminar habilidades anteriores
    await db.DetalleHabilidad.destroy({ where: { Id_Postulante: idPostulante } });

    // Insertar nuevas habilidades
    for (const idHabilidad of habilidades) {
      await db.DetalleHabilidad.create({
        Id_Postulante: idPostulante,
        Id_Habilidad: idHabilidad
      });
    }

    // Buscar postulante
    const postulante = await db.Postulante.findByPk(idPostulante);
    if (!postulante) {
      return res.status(404).json({ error: 'Postulante no encontrado' });
    }

    // Obtener descripciones de habilidades
    const habilidadesSeleccionadas = await db.Habilidad.findAll({
      where: { Id_Habilidad: habilidades }
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; border: 1px solid #ddd;">

        <div style="background-color: #0f172a; padding: 20px;">
          <h1 style="color: white; text-align: center; margin: 0;">DevSelectAI</h1>
        </div>

        <div style="padding: 20px;">
          <p>¡Hola ${postulante.Nombre} ${postulante.Apellido}!</p>

          <p>
            Desde <strong>DevSelectAI</strong>, el sistema inteligente de evaluación técnica y conductual para prácticas preprofesionales en la UNEMI, te invitamos a completar una evaluación de autoconocimiento que forma parte del proceso de postulación.
          </p>

          <p><strong>Para iniciar, sigue estas indicaciones:</strong></p>
          <ul>
            <li>Haz clic en el siguiente botón:</li>
            <li>La entrevista se abrirá en una nueva pestaña</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
           <a href="${baseUrl}/postulador/entrevista/inicio?token=${postulante.token_entrevista}" style="background-color:rgb(0, 24, 50); color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              Ir a la entrevista
            </a>
          </div>

          <p><strong>Habilidades que seleccionaste:</strong></p>
          <ul style="background-color: #f1f1f1; padding: 15px; border-radius: 6px;">
            ${habilidadesSeleccionadas.map(h => `<li>${h.Descripcion}</li>`).join('')}
          </ul>

          <p style="margin-top: 30px;">
            Te recomendamos usar el navegador <strong>Google Chrome</strong> y verificar tu conexión a internet. Asegúrate de tener al menos <strong>10 Mbps</strong> para una experiencia fluida.
          </p>

          <p>Te deseamos muchos éxitos. ¡Seguro te irá increíble!</p>
        </div>

        <div style="background-color: #0f172a; color: white; text-align: center; font-size: 12px; padding: 10px;">
          ¿Tienes problemas para ingresar?, comunícate con nuestra Mesa de Servicio <a href="http://soporte.com" style="color: #93c5fd;">soporte.com</a>
        </div>
      </div>
    `;

    await sendEmail(postulante.Correo, "🧠 Habilidades seleccionadas - DevSelectAI", html);

    res.json({ mensaje: 'Habilidades guardadas correctamente y correo enviado.' });
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


module.exports = {
  crearPostulante,
  guardarHabilidades,
  obtenerPorToken
};
