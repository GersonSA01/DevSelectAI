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

      if (!datos.Cedula || !datos.Nombre || !datos.Apellido || !datos.Correo || !datos.Contrasena) {
        return res.status(400).json({ error: "Faltan campos obligatorios." });
      }

      if (!/^\d{10}$/.test(datos.Cedula)) {
        return res.status(400).json({ error: "La cédula debe tener exactamente 10 dígitos." });
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.Correo)) {
        return res.status(400).json({ error: "El correo no es válido." });
      }

      if (datos.Contrasena.length < 8) {
        return res.status(400).json({ error: "La contraseña debe tener mínimo 8 caracteres." });
      }


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

  if (!idPostulante || !Array.isArray(habilidades) || habilidades.length === 0 || habilidades.length > 3) {
    return res.status(400).json({ error: "Debes seleccionar entre 1 y 3 habilidades" });
  }

  for (const h of habilidades) {
    if (!Number.isInteger(h) || h <= 0) {
      return res.status(400).json({ error: "Las habilidades deben ser números enteros positivos." });
    }
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

  if (!idPostulante || !idVacante || idPostulante <= 0 || idVacante <= 0) {
  return res.status(400).json({ error: "Datos inválidos para asignar vacante." });
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
  if (!/^\d{10}$/.test(cedula)) {
    return res.status(400).json({ error: "Cédula inválida." });
  }

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
  if (!id || !nuevoEstado || id <= 0 || nuevoEstado <= 0) {
    return res.status(400).json({ error: "Datos inválidos." });
  }

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
    const registro = await db.Postulante.findOne({
      where: { id_postulante: idPostulante },
      include: [
        { model: db.EstadoPostulacion, as: 'estadoPostulacion' },
        {
          model: db.PostulanteVacante,
          as: 'selecciones',
          include: [
            {
              model: db.ProgramacionPostulacion,
              as: 'programacionPostulacion',
              include: [{ model: db.Programacion, as: 'programacion' }]
            }
          ]
        }
      ]
    });

    if (!registro) {
      return res.json({ estado: 'proceso', mensaje: 'No tienes una postulación activa en este momento. Por favor selecciona una vacante para iniciar.' });
    }

    const estadoId = registro.id_EstadoPostulacion;
    const descripcion = registro.estadoPostulacion?.descripcion?.toLowerCase() || '';

    let estado = '';
    let mensaje = '';
    let fechas = null;

    switch (estadoId) {
      case 1: // Por evaluar
        estado = 'por_evaluar';
        mensaje =
          'Tu postulación ha sido recibida correctamente y está lista para ser evaluada. Puedes iniciar tu proceso de entrevistas y evaluaciones cuando lo desees.😊';
        break;

      case 2: // Evaluado
        estado = 'evaluado';
        mensaje =
          'Ya has completado tu evaluación🥳. Estamos revisando tus resultados y te notificaremos por correo cuando tengamos una decisión.😄';
        break;

      case 3: // Aprobado
        estado = 'aprobado';
        mensaje =
          '🎉 ¡Felicidades! Has sido aprobado/a para la vacante asignada. Revisa tu correo para conocer los detalles de tu asignación y los próximos pasos.🤩';
        break;

      case 4: // Rechazado
        estado = 'rechazado';
        mensaje =
          'Lamentamos informarte que no has sido seleccionado/a en esta ocasión. No te desanimes, puedes intentarlo nuevamente en el siguiente periodo.😞';
        break;

      case 5: { // Calificado
        estado = 'calificado';
        mensaje =
          'Tu calificación final ha sido registrada en el sistema. Debes estar atento a tu correo institucional en este rango de fecha.😊';

        const seleccion = registro.selecciones?.[0];
        const programacion = seleccion?.programacionPostulacion?.programacion;

        if (programacion) {
          fechas = {
            inicio: programacion.FechIniAprobacion,
            fin: programacion.FechFinAprobacion
          };
        }
        break;
      }

      default:
        estado = 'proceso';
        mensaje =
          'Tu estado actual no ha podido ser determinado. Por favor contacta con soporte técnico para más información.';
    }

    return res.json({ estado, mensaje, fechas });
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



const aprobar = async (req, res) => {
  const { id } = req.params;

  try {
    const postulante = await db.Postulante.findByPk(id);
    if (!postulante) {
      return res.status(404).json({ message: 'Postulante no encontrado' });
    }

    // intenta traer las relaciones opcionales
    const postulanteVacante = await db.PostulanteVacante.findOne({
      where: { Id_Postulante: id },
      include: [
        { model: db.Vacante, as: 'vacante' },
        {
          model: db.ProgramacionPostulacion,
          as: 'programacionPostulacion',
          include: [{ model: db.Programacion, as: 'programacion' }]
        }
      ]
    });

    if (!postulanteVacante || !postulanteVacante.vacante) {
      return res.status(404).json({ message: 'No se encontró la vacante asociada al postulante' });
    }

    const vacante = postulanteVacante.vacante;
    const programacion = postulanteVacante.programacionPostulacion?.programacion;

    // 🚨 Validar si quedan cupos
    if (vacante.Cantidad <= 0) {
      return res.status(400).json({
        message: `No hay más cupos disponibles para la vacante "${vacante.Descripcion}"`
      });
    }

    // ahora sí actualiza estado y resta 1 cupo
    postulante.id_EstadoPostulacion = 3; // Aprobado
    await postulante.save();

    vacante.Cantidad -= 1;
    await vacante.save();

    let periodoPostulacion = null;
    if (programacion) {
      const formatFecha = (iso) => {
        const d = new Date(iso);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd}-${mm}-${yyyy}`;
      };
      periodoPostulacion = `${formatFecha(programacion.FechIniPostulacion)} → ${formatFecha(programacion.FechFinPostulacion)}`;
    }

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; border: 1px solid #ccc; border-radius: 6px; overflow: hidden;">
      <div style="background-color: #0f172a; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">DevSelectAI</h1>
      </div>

      <div style="padding: 30px; text-align: center;">
        <div style="font-size: 50px; margin-bottom: 10px;">🎉</div>
        <h2 style="color: #0f172a; margin: 0;">¡Felicidades!</h2>
        <p style="font-size: 15px; color: #333; margin-top: 20px;">
          Estimado/a <strong>${postulante.Nombre} ${postulante.Apellido}</strong>,
        </p>
        <p style="font-size: 15px; color: #333; margin: 15px 0;">
          Nos complace informarte que has sido <strong>APROBADO/A</strong> en el proceso de selección.
        </p>
        <p style="font-size: 15px; color: #333; margin: 15px 0;">
          Vacante: <strong>${vacante.Descripcion}</strong>
        </p>
        ${periodoPostulacion ? `
        <p style="font-size: 15px; color: #333; margin: 15px 0;">
          Periodo de postulación: <strong>${periodoPostulacion}</strong>
        </p>` : ''}
        <p style="font-size: 15px; color: #333; margin: 15px 0;">
          Diríjase al Bloque C para mayor información.
        </p>
        <p style="font-size: 15px; color: #333; margin-top: 20px;">
          ¡Bienvenido a esta gran experiencia profesional!
        </p>
      </div>

      <div style="background-color: #0f172a; color: #ccc; text-align: center; padding: 10px; font-size: 13px;">
        ¿Tienes dudas? Visítanos en <a href="https://soporte.com" style="color: #93c5fd;">soporte.com</a>
      </div>
    </div>
    `;

    await sendEmail(postulante.Correo, "Resultado de postulación - DevSelectAI", html);

    res.json({
      message: 'Postulante aprobado y correo enviado',
      postulante,
      vacante: vacante?.Descripcion || null,
      periodoPostulacion
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al aprobar postulante' });
  }
};



const rechazar = async (req, res) => {
  const { id } = req.params;

  try {
    const postulante = await db.Postulante.findByPk(id);
    if (!postulante) {
      return res.status(404).json({ message: 'Postulante no encontrado' });
    }

    const postulanteVacante = await db.PostulanteVacante.findOne({
      where: { Id_Postulante: id },
      include: [
        {
          model: db.Vacante,
          as: 'vacante'
        },
        {
          model: db.ProgramacionPostulacion,
          as: 'programacionPostulacion',
          include: [
            {
              model: db.Programacion,
              as: 'programacion'
            }
          ]
        }
      ]
    });

    if (!postulanteVacante) {
      return res.status(404).json({ message: 'No se encontró la relación Postulante-Vacante' });
    }

    const vacante = postulanteVacante.vacante;
    const programacionPostulacion = postulanteVacante.programacionPostulacion;
    const programacion = programacionPostulacion?.programacion;

    if (!vacante) {
      return res.status(404).json({ message: 'Vacante asociada no encontrada' });
    }

    if (!programacion) {
      return res.status(404).json({ message: 'Periodo de postulación no encontrado' });
    }

    // Actualizar estado del postulante
    postulante.id_EstadoPostulacion = 4; // Rechazado
    await postulante.save();

    // Formatear fechas a dd-mm-yyyy
    const formatFecha = (isoDate) => {
      const date = new Date(isoDate);
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    };

    const periodoPostulacion = `${formatFecha(programacion.FechIniPostulacion)} → ${formatFecha(programacion.FechFinPostulacion)}`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; border: 1px solid #ccc; border-radius: 6px; overflow: hidden;">
      <div style="background-color: #0f172a; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">DevSelectAI</h1>
      </div>

      <div style="padding: 30px; text-align: center;">
        <div style="font-size: 50px; margin-bottom: 10px;">😔</div>
        <h2 style="color: #0f172a; margin: 0;">Resultado de tu postulación</h2>
        <p style="font-size: 15px; color: #333; margin-top: 20px;">
          Estimado/a <strong>${postulante.Nombre} ${postulante.Apellido}</strong>,
        </p>
        <p style="font-size: 15px; color: #333; margin: 15px 0;">
          Lamentamos informarte que en esta ocasión no has sido seleccionado en el proceso para la vacante:
        </p>
        <p style="font-size: 16px; font-weight: bold; color: #0f172a;">"${vacante.Descripcion}"</p>
        <p style="font-size: 15px; color: #333; margin: 15px 0;">
          Este resultado corresponde al <strong>periodo de postulación:</strong><br>
          <span style="color:#0f172a;">${periodoPostulacion}</span>
        </p>
        <p style="font-size: 15px; color: #333; margin: 15px 0;">
          Queremos animarte a seguir formándote y a intentarlo nuevamente en futuras convocatorias. Tu esfuerzo y dedicación son muy valorados.
        </p>
        <p style="font-size: 15px; color: #333; margin-top: 20px;">
          ¡Mucho éxito en tus próximos retos!
        </p>
      </div>

      <div style="background-color: #0f172a; color: #ccc; text-align: center; padding: 10px; font-size: 13px;">
        ¿Tienes dudas? Visítanos en <a href="https://soporte.com" style="color: #93c5fd;">soporte.com</a>
      </div>
    </div>
    `;

    await sendEmail(postulante.Correo, "Resultado de postulación - DevSelectAI", html);

    res.json({
      message: 'Postulante rechazado y correo enviado',
      postulante,
      vacante: vacante.Descripcion,
      periodoPostulacion
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al rechazar postulante' });
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
  verificarEstadoPostulacion,
  aprobar,
  rechazar
};
