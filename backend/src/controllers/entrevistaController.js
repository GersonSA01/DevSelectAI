const axios = require('axios');
const FormData = require('form-data');
const db = require('../models');

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

    let entrevista = await db.EntrevistaOral.findOne({
      where: { Id_Postulante: idPostulante }
    });

    if (!entrevista) {
      entrevista = await db.EntrevistaOral.create({
        Id_Postulante: idPostulante,
        RetroalimentacionIA: null
      });
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
      prompt = `Este es el nombre completo del postulante: ${nombreCompleto}. Estas son sus habilidades destacadas: ${habilidadesTexto}. Actúa como un entrevistador virtual asignado por DevSelectAI. Presentate al postulante y formula una primera pregunta técnica relacionada con esas habilidades. La pregunta debe ser clara, breve y concreta. Solo escribe la pregunta, sin introducciones.`;
    } else if (step === '1') {
      prompt = `El postulante respondió: "${textoUsuario}". Formula una segunda pregunta técnica relacionada con las habilidades: ${habilidadesTexto}. Sé breve y claro.`;
    } else if (step === '2') {
      prompt = `El postulante respondió: "${textoUsuario}". Formula una tercera y última pregunta técnica relacionada con las habilidades: ${habilidadesTexto}.`;
    } else if (step === '3') {
      prompt = `Respuestas del postulante:\n1) ${respuestas[0]}\n2) ${respuestas[1]}\n3) ${textoUsuario}.\nDi en una sola frase si el postulante AVANZA o NO AVANZA. Luego, en una segunda frase muy breve, justifica tu decisión como retroalimentación profesional y empática.`;
    }

    const gptRes = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo-0125',
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

    console.log('➡️ Paso actual:', step);
    console.log('🧠 Respuesta generada por IA:', respuestaGPT);

    if (['1', '2', '3'].includes(step)) {
      await db.PreguntaOral.create({
        Ronda: parseInt(step),
        PreguntaIA: respuestaGPT,
        RespuestaPostulante: textoUsuario,
        CalificacionIA: null,
        Id_Entrevista: entrevista.Id_Entrevista,
        TiempoRptaPostulante: tiempoRespuesta
      });
    }

    if (parseInt(step) === 3) {
      await entrevista.update({
        RetroalimentacionIA: respuestaGPT
      });
    }

    const ttsRes = await axios.post(
      'https://api.openai.com/v1/audio/speech',
      {
        model: 'tts-1',
        input: respuestaGPT,
        voice: 'alloy'
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    res.status(200).json({
      audio: Buffer.from(ttsRes.data).toString('base64'),
      respuestaGPT,
      textoUsuario
    });

  } catch (error) {
    console.error('Error al procesar audio:', error);
    res.status(500).json({ error: 'Error al procesar el audio' });
  }
};
