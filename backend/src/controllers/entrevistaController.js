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
    const idPostulante = req.body.idPostulante;
    const tiempoRespuesta = parseInt(req.body.tiempoRespuesta || '0');

    if (!step || !idPostulante) {
      return res.status(400).json({ error: 'Datos incompletos.' });
    }

    const postulante = await db.Postulante.findByPk(idPostulante, {
      include: [{ model: db.DetalleHabilidad, as: 'habilidades', include: [{ model: db.Habilidad, as: 'habilidad' }] }]
    });
    if (!postulante) throw new Error('Postulante no encontrado.');

    const nombreCompleto = `${postulante.Nombre} ${postulante.Apellido}`;
    const habilidadesTexto = postulante.habilidades.map(h => h.habilidad.Descripcion).join(', ');

    const evaluacion = await db.Evaluacion.findOne({
      where: { Id_postulante: idPostulante },
      order: [['id_Evaluacion', 'DESC']]
    });

    let entrevista = evaluacion?.Id_Entrevista
      ? await db.EntrevistaOral.findByPk(evaluacion.Id_Entrevista)
      : await db.EntrevistaOral.create({ RetroalimentacionIA: null });

    if (!evaluacion) {
      await db.Evaluacion.create({ Id_postulante: idPostulante, Id_Entrevista: entrevista.Id_Entrevista });
    } else if (!evaluacion.Id_Entrevista) {
      await evaluacion.update({ Id_Entrevista: entrevista.Id_Entrevista });
    }

    let textoUsuario = '';

    if (step !== '0' && audioBlob?.size > 0) {
      const formData = new FormData();
      formData.append('file', audioBlob.data, {
        filename: 'voz.webm',
        contentType: 'audio/webm'
      });
      formData.append('model', 'whisper-1');

      const whisperRes = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        formData,
        { headers: { ...formData.getHeaders(), Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
      );

      textoUsuario = whisperRes.data.text?.trim() || '';
    }

    let prompt = '';
    if (step === '0') {
      prompt = `Este es el nombre completo del postulante: ${nombreCompleto}. Estas son sus habilidades: ${habilidadesTexto}. Saluda al postulante y formula la primera pregunta técnica.`;
    } else if (step === '1' || step === '2') {
      prompt = textoUsuario
        ? `El postulante respondió: "${textoUsuario}". Formula la siguiente pregunta técnica.`
        : `El postulante no respondió. Continúa con la siguiente pregunta técnica.`;
    } else if (step === '3') {
      const preguntas = await db.PreguntaOral.findAll({
        where: { Id_Entrevista: entrevista.Id_Entrevista }
      });
      const totalCalificacion = preguntas.reduce((acc, p) => acc + (p.CalificacionIA || 0), 0);

      prompt = textoUsuario
        ? `El postulante respondió: "${textoUsuario}". Ahora genera la retroalimentación y calificación final. Calificación actual: ${totalCalificacion}/6.`
        : `El postulante no respondió. Aun así, genera retroalimentación profesional. Calificación actual: ${totalCalificacion}/6.`;
    }

    const gptRes = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'Eres un reclutador técnico de UNEMI. Sé breve, profesional y empático.' },
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
      let calificacionIA = 0;
      let comentarioIA = '';

      if (textoUsuario) {
        const evalPrompt = `
Evalúa esta respuesta con base en dos criterios:
1. ¿Responde correctamente?
2. ¿Usa lenguaje técnico?

Devuelve este JSON:
{"respuestaBien": true/false, "usoLenguajeTecnico": true/false}

Respuesta: "${textoUsuario}"`;

        try {
          const evalRes = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
              model: 'gpt-4',
              messages: [
                { role: 'system', content: 'Eres un evaluador técnico objetivo. Devuelve solo el JSON.' },
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

          const parsed = JSON.parse(evalRes.data.choices[0].message.content);

          if (parsed.respuestaBien) calificacionIA = 1;
          if (parsed.respuestaBien && parsed.usoLenguajeTecnico) calificacionIA = 2;
        } catch {
          comentarioIA = 'No se pudo evaluar correctamente.';
        }
      } else {
        comentarioIA = 'No hubo respuesta.';
      }

      await db.PreguntaOral.create({
        Ronda: parseInt(step),
        PreguntaIA: respuestaGPT,
        RespuestaPostulante: textoUsuario || '(sin respuesta)',
        CalificacionIA: calificacionIA,
        ComentarioIA: comentarioIA,
        Id_Entrevista: entrevista.Id_Entrevista,
        TiempoRptaPostulante: tiempoRespuesta
      });
    }

    if (parseInt(step) === 3) {
      await entrevista.update({ RetroalimentacionIA: respuestaGPT.trim() });
    }

    let audioBase64 = null;
    try {
      const ttsRes = await retryAxiosTTS(
        {
          model: 'tts-1',
          input: respuestaGPT.substring(0, 300).replace(/[\n\r]+/g, ' '),
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
    } catch (err) {
      console.warn('⚠️ No se pudo generar audio TTS.');
    }

    res.status(200).json({
      audio: audioBase64,
      respuestaGPT,
      textoUsuario,
      hasAudio: !!audioBase64
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al procesar audio', detalle: err.message });
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
