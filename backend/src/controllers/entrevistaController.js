const axios = require('axios');
const FormData = require('form-data');
const db = require('../models');

exports.procesarAudio = async (req, res) => {
  try {
    const audioBlob = req.files.audio;
    const step = req.body.step;
    const respuestas = JSON.parse(req.body.respuestas || '[]');
    const idPostulante = req.body.idPostulante;

    // Buscar info del postulante con habilidades
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

    // Crear entrevista si no existe
    let entrevista = await db.EntrevistaOral.findOne({
      where: { Id_Postulante: idPostulante }
    });

    if (!entrevista) {
      entrevista = await db.EntrevistaOral.create({
        Id_Postulante: idPostulante,
        RetroalimentacionIA: null
      });
    }

    // Transcripción con Whisper
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

    const textoUsuario = whisperRes.data.text;

    // Actualizar respuestas
    if (step === '1') respuestas[0] = textoUsuario;
    else if (step === '2') respuestas[1] = textoUsuario;
    else if (step === '3') respuestas[2] = textoUsuario;

    // Generar prompt
    let prompt = '';
    if (step == 1) {
      prompt = `Hola ${nombreCompleto}. Estas son tus habilidades seleccionadas: ${habilidadesTexto}.
Con base en eso, genera una primera pregunta técnica clara, concreta y breve para que el postulante la responda oralmente. Solo escribe la pregunta.`;
    } else if (step == 2) {
      prompt = `El postulante respondió: "${textoUsuario}". Formula una segunda pregunta técnica relacionada. Sé breve y claro. Solo escribe la pregunta.`;
    } else if (step == 3) {
      prompt = `Respuestas del postulante:\n1) ${respuestas[0]}\n2) ${respuestas[1]}\n3) ${textoUsuario}.
Evalúa si es apto para avanzar a la siguiente etapa técnica. Justifica tu decisión brevemente y da un mensaje profesional y empático de retroalimentación.`;
    }

    // Obtener respuesta GPT
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

    // Guardar en base de datos
    if (step === '1' || step === '2') {
      await db.PreguntaOral.create({
        Ronda: parseInt(step),
        PreguntaIA: respuestaGPT,
        RespuestaPostulante: textoUsuario,
        CalificacionIA: null,
        Id_Entrevista: entrevista.Id_Entrevista
      });
    }

    if (step === '3') {
      await entrevista.update({
        RetroalimentacionIA: respuestaGPT
      });
    }

    // TTS con OpenAI
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

    // Enviar headers + audio
res.status(200).json({
  audio: Buffer.from(ttsRes.data).toString('base64'), // codifica el audio como base64
  respuestaGPT,
  textoUsuario
});

  } catch (error) {
    console.error('Error al procesar audio:', error);
    res.status(500).json({ error: 'Error al procesar el audio' });
  }
};
