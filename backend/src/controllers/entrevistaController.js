const axios = require('axios');
const FormData = require('form-data');
const db = require('../models');

exports.procesarAudio = async (req, res) => {
  try {
    const audioBlob = req.files?.audio;
    const step = parseInt(req.body.step);
    const respuestas = JSON.parse(req.body.respuestas || '[]');
    const idPostulante = req.body.idPostulante;

    console.log('📥 Paso recibido:', step);
    console.log('🆔 ID del postulante:', idPostulante);

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

    console.log('👤 Postulante:', nombreCompleto);
    console.log('💡 Habilidades:', habilidadesTexto);

    let entrevista = await db.EntrevistaOral.findOne({
      where: { Id_Postulante: idPostulante }
    });

    if (!entrevista) {
      entrevista = await db.EntrevistaOral.create({
        Id_Postulante: idPostulante,
        RetroalimentacionIA: null
      });
      console.log('🆕 Entrevista creada con ID:', entrevista.Id_Entrevista);
    } else {
      console.log('📋 Entrevista existente:', entrevista.Id_Entrevista);
    }

    let textoUsuario = '';
    if (step !== 0 && audioBlob) {
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
      console.log(`📝 Transcripción (${step}):`, textoUsuario);

      if (step >= 1 && step <= 3) {
        respuestas[step - 1] = textoUsuario;
      }
    }

    let prompt = '';
    if (step === 0) {
      prompt = `Este es el nombre completo del postulante: ${nombreCompleto}. Estas son sus habilidades destacadas: ${habilidadesTexto}. Actúa como un entrevistador virtual asignado por DevSelectAI. Presentate al postulante y formula una primera pregunta técnica relacionada con esas habilidades. Solo escribe la pregunta, sin introducciones.`;
    } else if (step === 1 || step === 2) {
      prompt = `El postulante respondió: "${textoUsuario}". Formula una pregunta técnica relacionada con las habilidades: ${habilidadesTexto}. Sé breve y claro.`;
    } else if (step === 3) {
      prompt = `Respuestas del postulante:\n1) ${respuestas[0]}\n2) ${respuestas[1]}\n3) ${textoUsuario}.\nDi en una sola frase si el postulante AVANZA o NO AVANZA. Luego, en una segunda frase muy breve, justifica tu decisión como retroalimentación profesional y empática.`;
    }

    console.log('🤖 Enviando prompt a GPT...');
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
    console.log(`📨 Respuesta GPT (step ${step}):`, respuestaGPT);

    // Guardar pregunta o retroalimentación
    if (step >= 0 && step <= 3) {
      await db.PreguntaOral.create({
        Ronda: step === 0 ? 1 : step,
        PreguntaIA: respuestaGPT,
        RespuestaPostulante: step === 0 ? null : textoUsuario,
        CalificacionIA: null,
        Id_Entrevista: entrevista.Id_Entrevista
      });
      console.log('💾 Guardando PreguntaOral en ronda', step === 0 ? 1 : step);
    }

    if (step === 3) {
      await entrevista.update({
        RetroalimentacionIA: respuestaGPT
      });
      console.log('📝 Retroalimentación guardada en EntrevistaOral');
    }

    // Convertir texto en voz
    console.log('🗣️ Generando audio con TTS...');
    const ttsRes = await axios.post(
      'https://api.openai.com/v1/audio/speech',
      {
        model: 'tts-1',
        input: respuestaGPT,
        voice: 'echo'
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    const audioBase64 = Buffer.from(ttsRes.data).toString('base64');
    console.log('✅ Audio generado con éxito. Tamaño base64:', audioBase64.length);

    res.status(200).json({
      audio: audioBase64,
      respuestaGPT,
      textoUsuario
    });

  } catch (error) {
    console.error('❌ Error al procesar audio:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Error al procesar el audio' });
  }
};
