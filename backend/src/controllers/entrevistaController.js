const axios = require('axios');
const FormData = require('form-data');
const db = require('../models');


const retryAxiosTTS = async (data, config, maxRetries = 2) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/audio/speech',
        data,
        config
      );
      return response;
    } catch (error) {
      const status = error?.response?.status;
      const isRetryable =
        status === 429 || status === 500 || error.code === 'ECONNABORTED';

      console.warn(`⚠️ Intento ${attempt} fallido (${status || error.code}).`);

      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }

      
      await new Promise(resolve => setTimeout(resolve, 4000 * attempt));
    }
  }
};

exports.procesarAudio = async (req, res) => {
  try {
    const audioBlob = req.files?.audio;
    const step = req.body.step;
    const respuestas = JSON.parse(req.body.respuestas || '[]');
    const idPostulante = req.body.idPostulante;
    const tiempoRespuesta = parseInt(req.body.tiempoRespuesta || '0');

    const postulante = await db.Postulante.findByPk(idPostulante, {
      include: [
        {
          model: db.DetalleHabilidad,
          as: 'habilidades',
          include: [{ model: db.Habilidad, as: 'habilidad' }]
        }
      ]
    });

    const nombreCompleto = `${postulante.Nombre} ${postulante.Apellido}`;
    const habilidades = postulante.habilidades.map(h => h.habilidad.Descripcion);
    const habilidadesTexto = habilidades.join(', ');

    let entrevista;

    const evaluacion = await db.Evaluacion.findOne({
      where: { Id_postulante: idPostulante },
      order: [['id_Evaluacion', 'DESC']]
    });

    if (evaluacion?.Id_Entrevista) {
      entrevista = await db.EntrevistaOral.findByPk(evaluacion.Id_Entrevista);
    } else {
      entrevista = await db.EntrevistaOral.create({ RetroalimentacionIA: null });

      if (evaluacion) {
        await evaluacion.update({ Id_Entrevista: entrevista.Id_Entrevista });
      } else {
        await db.Evaluacion.create({
          Id_postulante: idPostulante,
          Id_Entrevista: entrevista.Id_Entrevista
        });
      }
    }

    let textoUsuario = '';
    if (step !== '0') {
      const formData = new FormData();
      formData.append('file', audioBlob.data, {
        filename: 'voz.webm',
        contentType: 'audio/webm'
      });
      formData.append('model', 'whisper-1');

      const whisperRes = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
          }
        }
      );

      textoUsuario = whisperRes.data.text;

      if (step === '1') respuestas[0] = textoUsuario;
      else if (step === '2') respuestas[1] = textoUsuario;
      else if (step === '3') respuestas[2] = textoUsuario;
    }

    let prompt = '';
    if (step === '0') {
      prompt = `Este es el nombre completo del postulante: ${nombreCompleto}. Estas son sus habilidades destacadas: ${habilidadesTexto}. Actúa como un entrevistador virtual asignado por DevSelectAI. Saluda al postulante y di "veo que te destacas en (menciona las habilidades)" y formula una primera pregunta técnica relacionada con esas habilidades. Debes ser breve.`;
    } else if (step === '1') {
      prompt = `El postulante respondió: "${textoUsuario}". Formula una segunda pregunta técnica relacionada con las habilidades: ${habilidadesTexto}. Sé breve y claro.`;
    } else if (step === '2') {
      prompt = `El postulante respondió: "${textoUsuario}". Formula una tercera y última pregunta técnica relacionada con las habilidades: ${habilidadesTexto}.`;
    } else if (step === '3') {
      const preguntas = await db.PreguntaOral.findAll({
        where: { Id_Entrevista: entrevista.Id_Entrevista }
      });

      const totalCalificacion = preguntas.reduce((acc, p) => acc + (p.CalificacionIA || 0), 0);

      prompt = `
El postulante ha obtenido un total de ${totalCalificacion} puntos sobre 6 posibles en la entrevista oral.

Con base en ese puntaje:
1. Inicia tu respuesta indicando la calificación que obtuvo: "Tu calificación en la entrevista oral fue de X/6."
2. Luego, escribe una breve observación profesional y empática sobre su desempeño.
No indiques si avanza o no. Solo incluye calificación y comentario.
Ejemplo:
"Tu calificación en la entrevista oral fue de 5/6. Has demostrado un buen dominio de tus habilidades técnicas y una actitud positiva."
`;
    }

    const gptRes = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'Eres un reclutador técnico de la Universidad Estatal de Milagro (UNEMI), evaluando postulantes a prácticas preprofesionales internas en DevSelectAI. Responde con frases breves, claras y profesionales. Enfócate en las competencias técnicas, actitud y expresión del postulante. Sé empático, objetivo y directo.'
          },
          { role: 'user', content: prompt }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const respuestaGPT = gptRes.data.choices[0].message.content;

    if (['1', '2', '3'].includes(step)) {
      const evalPrompt = `
Evalúa esta respuesta del postulante con base en dos criterios:
1. ¿Responde correctamente o de forma adecuada a una pregunta técnica?
2. ¿Utiliza lenguaje técnico específico en su explicación?

Responde ÚNICAMENTE este JSON:
{
  "respuestaBien": true/false,
  "usoLenguajeTecnico": true/false
}

Respuesta del postulante: "${textoUsuario}"
`;

      let calificacionIA = 0;
      try {
        const evalRes = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content:
                  'Eres un evaluador técnico objetivo. Evalúa si una respuesta es adecuada y si se usó lenguaje técnico. Devuelve solo el JSON solicitado.'
              },
              { role: 'user', content: evalPrompt }
            ]
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const evalData = evalRes.data.choices[0].message.content;
        const parsed = JSON.parse(evalData);

        if (parsed.respuestaBien) calificacionIA = 1;
        if (parsed.respuestaBien && parsed.usoLenguajeTecnico) calificacionIA = 2;
      } catch (err) {
        console.warn('⚠️ No se pudo interpretar la calificación IA. Se asigna 0.', err.message);
      }

      await db.PreguntaOral.create({
        Ronda: parseInt(step),
        PreguntaIA: respuestaGPT,
        RespuestaPostulante: textoUsuario,
        CalificacionIA: calificacionIA,
        Id_Entrevista: entrevista.Id_Entrevista,
        TiempoRptaPostulante: tiempoRespuesta
      });
    }

    if (parseInt(step) === 3) {
      await entrevista.update({
        RetroalimentacionIA: respuestaGPT.trim()
      });
    }

    let audioBase64 = null;
    try {
      const textoLimpio = respuestaGPT
        .replace(/[\n\r]+/g, ' ')
        .replace(/[^\x00-\x7F]/g, '')
        .substring(0, 300);

      if (textoLimpio.trim().length > 0) {
        const ttsRes = await retryAxiosTTS(
          {
            model: 'tts-1',
            input: textoLimpio,
            voice: 'nova'
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer',
            timeout: 30000
          }
        );

        audioBase64 = Buffer.from(ttsRes.data).toString('base64');
      } else {
        console.warn('⚠️ Texto vacío, no se genera voz');
      }
    } catch (ttsError) {
      console.error('❌ Error al generar TTS luego de reintentos:', ttsError.response?.data || ttsError.message);
    }

    res.status(200).json({
      audio: audioBase64,
      respuestaGPT,
      textoUsuario,
      hasAudio: audioBase64 !== null
    });

  } catch (error) {
    console.error('❌ Error al procesar audio:', error);
    res.status(500).json({
      error: 'Error al procesar el audio',
      detalle: error.message
    });
  }
};


exports.getPreguntasOrales = async (req, res) => {
  const idEntrevista = parseInt(req.params.idEntrevista);

  try {
    const preguntas = await db.PreguntaOral.findAll({
      where: { Id_Entrevista: idEntrevista },
      order: [['Ronda', 'ASC']],
      attributes: [
        'Id_Pregunta_oral',
        'Ronda',
        'PreguntaIA',
        'RespuestaPostulante',
        'CalificacionIA',
        'TiempoRptaPostulante'
      ]
    });

    const resultado = preguntas.map(p => ({
      id: p.Id_Pregunta_oral,
      ronda: p.Ronda,
      pregunta: p.PreguntaIA,
      respuesta: p.RespuestaPostulante,
      calificacionIA: p.CalificacionIA,
      tiempo: p.TiempoRptaPostulante
    }));

    res.json(resultado);
  } catch (error) {
    console.error('❌ Error al obtener preguntas orales:', error.message);
    res.status(500).json({ error: error.message });
  }
};
