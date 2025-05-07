const axios = require('axios');
const FormData = require('form-data');

exports.procesarAudio = async (req, res) => {
  try {
    const audioBlob = req.files.audio;
    const step = req.body.step;
    const respuestas = JSON.parse(req.body.respuestas || '[]');

    // Preparar audio para Whisper
    const formData = new FormData();
    formData.append('file', audioBlob.data, {
      filename: 'voz.webm',
      contentType: 'audio/webm'
    });
    formData.append('model', 'whisper-1');

    // Transcripción con Whisper
    const whisperRes = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const textoUsuario = whisperRes.data.text;

    // Guardar texto transcrito en posición correspondiente
    if (step === '1') respuestas[0] = textoUsuario;
    else if (step === '2') respuestas[1] = textoUsuario;
    else if (step === '3') respuestas[2] = textoUsuario;

    // Crear prompt
    let prompt = '';
    if (step == 1) {
      prompt = `El postulante se presentó así: "${textoUsuario}". Formula una primera pregunta técnica clara, concreta y breve para que la responda oralmente. Solo escribe la pregunta.`;
    } else if (step == 2) {
      prompt = `El postulante respondió: "${textoUsuario}". Formula una segunda pregunta técnica relacionada. Sé breve y claro. Solo escribe la pregunta.`;
    } else if (step == 3) {
      prompt = `Respuestas del postulante:\n1) ${respuestas[0]}\n2) ${respuestas[1]}\n3) ${textoUsuario}.\nRedacta un mensaje final breve para el postulante con feedback, haciendo un análisis hacia el postulante en base a las respuestas. Dile que avanzará a la siguiente etapa de evaluación teórica. Recuerda ser breve.`;
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

    // TTS
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

    // Enviar headers antes del audio
    res.setHeader('X-Respuesta-GPT', respuestaGPT);
    res.setHeader('X-Texto-Usuario', textoUsuario);
    res.setHeader('Access-Control-Expose-Headers', 'X-Respuesta-GPT, X-Texto-Usuario');
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(ttsRes.data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar el audio' });
  }
};
