const axios = require('axios');
const FormData = require('form-data');
const db = require('../models');

const retryAxiosTTS = async (data, config, maxRetries = 2) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.post('https://api.openai.com/v1/audio/speech', data, config);
      return response;
    } catch (error) {
      const status = error?.response?.status;
      const isRetryable = status === 429 || status === 500 || error.code === 'ECONNABORTED';
      console.warn(`⚠ Intento ${attempt} fallido (${status || error.code}).`);
      if (!isRetryable || attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 4000 * attempt));
    }
  }
};

exports.procesarAudio = async (req, res) => {
  try {
    // Logging detallado para debug
    console.log('📋 Datos recibidos en procesarAudio:');
    console.log('- req.body:', req.body);
    console.log('- req.files:', req.files ? Object.keys(req.files) : 'No files');
    console.log('- step:', req.body.step);
    console.log('- idPostulante:', req.body.idPostulante);
    console.log('- idVacante:', req.body.idVacante);
    console.log('- tiempoRespuesta:', req.body.tiempoRespuesta);

    const audioBlob = req.files?.audio;
    const step = req.body.step;
    const idPostulante = req.body.idPostulante;
    let idVacante = req.body.idVacante;
    const tiempoRespuesta = parseInt(req.body.tiempoRespuesta || '0');

    // Validación más específica con mejores mensajes de error
    if (!step) {
      console.error('❌ Falta el parámetro step');
      return res.status(400).json({ error: 'Falta el parámetro step' });
    }
    if (!idPostulante) {
      console.error('❌ Falta el parámetro idPostulante');
      return res.status(400).json({ error: 'Falta el parámetro idPostulante' });
    }

    console.log('✅ Validación de parámetros básicos completada');

    // Obtener datos del postulante con sus vacantes asociadas
    const postulante = await db.Postulante.findByPk(idPostulante, {
      include: [
        {
          model: db.PostulanteVacante,
          as: 'selecciones',
          include: [
            {
              model: db.Vacante,
              as: 'vacante'
            }
          ]
        }
      ]
    });
    
    if (!postulante) {
      console.error('❌ Postulante no encontrado:', idPostulante);
      return res.status(404).json({ error: 'Postulante no encontrado' });
    }

    // Si no se proporciona idVacante, intentar obtenerlo de la relación PostulanteVacante
    if (!idVacante) {
      // Buscar la vacante más reciente del postulante
      const postulanteVacante = await db.PostulanteVacante.findOne({
        where: { Id_Postulante: idPostulante },
        order: [['Id_Vacante', 'DESC']] // Obtener la más reciente
      });

      if (postulanteVacante) {
        idVacante = postulanteVacante.Id_Vacante;
        console.log('✅ idVacante obtenido de PostulanteVacante:', idVacante);
      }
    }

    // Validar que tenemos idVacante
    if (!idVacante) {
      console.error('❌ No se pudo obtener idVacante');
      return res.status(400).json({ error: 'No se encontró una vacante asociada al postulante' });
    }

    // Obtener datos de la vacante con sus habilidades requeridas
    const vacante = await db.Vacante.findByPk(idVacante, {
      include: [
        {
          model: db.VacanteHabilidad,
          as: 'habilidades',
          include: [{ model: db.Habilidad, as: 'habilidad' }]
        },
        {
          model: db.Empresa,
          as: 'empresa'
        }
      ]
    });
    
    if (!vacante) {
      console.error('❌ Vacante no encontrada:', idVacante);
      return res.status(404).json({ error: 'Vacante no encontrada' });
    }

    console.log('✅ Datos de postulante y vacante obtenidos');

    const nombreCompleto = `${postulante.Nombre} ${postulante.Apellido}`;
    const habilidadesVacante = vacante.habilidades && vacante.habilidades.length > 0 
      ? vacante.habilidades.map(h => h.habilidad.Descripcion).join(', ')
      : 'Habilidades generales';
    const empresaNombre = vacante.empresa?.Nombre || 'Empresa no especificada';
    const vacanteDescripcion = vacante.Descripcion || 'Descripción no disponible';

    // Buscar o crear evaluación
    let evaluacion = await db.Evaluacion.findOne({
      where: { Id_postulante: idPostulante },
      order: [['id_Evaluacion', 'DESC']]
    });

    let entrevista;
    if (evaluacion?.Id_Entrevista) {
      entrevista = await db.EntrevistaOral.findByPk(evaluacion.Id_Entrevista);
    }
    
    if (!entrevista) {
      entrevista = await db.EntrevistaOral.create({ RetroalimentacionIA: null });
      console.log('✅ Nueva entrevista creada:', entrevista.Id_Entrevista);
    }

    if (!evaluacion) {
      evaluacion = await db.Evaluacion.create({
        Id_postulante: idPostulante,
        Id_Entrevista: entrevista.Id_Entrevista
      });
      console.log('✅ Nueva evaluación creada');
    } else if (!evaluacion.Id_Entrevista) {
      await evaluacion.update({ Id_Entrevista: entrevista.Id_Entrevista });
      console.log('✅ Evaluación actualizada con ID de entrevista');
    }

    // Procesar audio si existe y no es step 0
    let textoUsuario = '';
    if (step !== '0' && audioBlob?.size > 0) {
      console.log('🎤 Procesando audio con Whisper...');
      try {
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
            },
            timeout: 30000
          }
        );
        textoUsuario = whisperRes.data.text?.trim() || '';
        console.log('✅ Audio transcrito:', textoUsuario);
      } catch (whisperError) {
        console.error('❌ Error en transcripción:', whisperError.message);
        textoUsuario = '';
      }
    }

    const systemMessage = `
Eres un reclutador técnico virtual de UNEMI especializado en evaluar candidatos para vacantes específicas.
Habla de forma profesional pero cercana, natural y conversacional.
No digas tu nombre ni un título. Solo puedes decir que eres el reclutador virtual.
No uses saludos ni despedidas formales. Responde en una sola frase clara y directa.
Enfócate en evaluar las habilidades técnicas específicas requeridas para la vacante.
    `.trim();

    let prompt = '';
    if (step === '0') {
      prompt = `
Este es el nombre completo del postulante: ${nombreCompleto}.
Esta es la vacante: ${vacanteDescripcion}.
Estas son las habilidades técnicas específicas requeridas para esta vacante: ${habilidadesVacante}.
Preséntate como el reclutador virtual, saluda al postulante por su nombre, menciona la vacante y las habilidades requerida de la vacante, y formula la primera pregunta técnica específica sobre una de estas habilidades requeridas en una sola frase.
      `.trim();
    } else if (step === '1' || step === '2') {
      prompt = `
El postulante respondió: "${textoUsuario}".
Basándote en las habilidades técnicas específicas requeridas para esta vacante: ${habilidadesVacante}.
Formula la siguiente pregunta técnica específica sobre alguna de estas habilidades en un tono conversacional, breve y en una sola frase.
      `.trim();
    } else if (step === '3') {
      const preguntas = await db.PreguntaOral.findAll({ 
        where: { Id_Entrevista: entrevista.Id_Entrevista } 
      });
      const totalCalificacion = preguntas.reduce((acc, p) => acc + (p.CalificacionIA || 0), 0);
      prompt = `
El postulante respondió: "${textoUsuario}".
Basándote en las habilidades técnicas específicas requeridas para esta vacante: ${habilidadesVacante}.
Genera una retroalimentación final evaluando qué tan bien el postulante demostró conocimiento en estas habilidades específicas, en una sola frase breve y conversacional.
Calificación actual: ${totalCalificacion}/6.
      `.trim();
    }

    console.log('🤖 Enviando prompt a GPT...');
    const gptRes = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemMessage }, 
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 200
      },
      {
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        timeout: 30000
      }
    );

    const respuestaGPT = gptRes.data.choices[0].message.content.trim();
    console.log('✅ Respuesta GPT obtenida:', respuestaGPT);

    // Lógica de guardado con flujo correcto
    if (step === '0') {
      await guardarPreguntaOral('0', respuestaGPT, null, 0, entrevista.Id_Entrevista);
    } else if (step === '1') {
      await actualizarRondaAnterior('0', textoUsuario, tiempoRespuesta, entrevista.Id_Entrevista, habilidadesVacante);
      await guardarPreguntaOral('1', respuestaGPT, null, 0, entrevista.Id_Entrevista);
    } else if (step === '2') {
      await actualizarRondaAnterior('1', textoUsuario, tiempoRespuesta, entrevista.Id_Entrevista, habilidadesVacante);
      await guardarPreguntaOral('2', respuestaGPT, null, 0, entrevista.Id_Entrevista);
    } else if (step === '3') {
      await actualizarRondaAnterior('2', textoUsuario, tiempoRespuesta, entrevista.Id_Entrevista, habilidadesVacante);
      await entrevista.update({ RetroalimentacionIA: respuestaGPT });
    }

    console.log('✅ Datos guardados correctamente');

    // Generar audio TTS
    let audioBase64 = null;
    try {
      console.log('🔊 Generando audio TTS...');
      const ttsRes = await retryAxiosTTS(
        {
          model: 'tts-1',
          input: respuestaGPT.substring(0, 300).replace(/\s+/g, ' ').trim(),
          voice: 'nova'
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept-Charset': 'utf-8'
          },
          responseType: 'arraybuffer',
          timeout: 30000
        }
      );
      audioBase64 = Buffer.from(ttsRes.data).toString('base64');
      console.log('✅ Audio TTS generado correctamente');
    } catch (ttsError) {
      console.warn('⚠ No se pudo generar audio TTS:', ttsError.message);
    }

    const response = {
      audio: audioBase64,
      respuestaGPT,
      textoUsuario,
      hasAudio: !!audioBase64,
      step: step,
      idEntrevista: entrevista.Id_Entrevista
    };

    console.log('✅ Respuesta enviada correctamente');
    res.status(200).json(response);

  } catch (err) {
    console.error('❌ Error en procesarAudio:', err);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ 
      error: 'Error al procesar audio', 
      detalle: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

async function actualizarRondaAnterior(ronda, respuestaPostulante, tiempo, idEntrevista, habilidadesVacante) {
  let calificacionIA = 0;
  let comentarioIA = '';

  console.log(`📝 Actualizando ronda ${ronda} con respuesta:`, respuestaPostulante);

  // Evaluar respuesta del postulante basándose en las habilidades de la vacante
  if (respuestaPostulante && respuestaPostulante.trim()) {
    const evalPrompt = `
Evalúa esta respuesta del postulante basándote en las habilidades técnicas específicas requeridas para la vacante.
Habilidades requeridas: ${habilidadesVacante}

Evalúa con base en estos criterios:
1. ¿Demuestra conocimiento técnico específico de alguna de las habilidades requeridas?
2. ¿Usa terminología técnica apropiada relacionada con estas habilidades?
3. ¿La respuesta es coherente y muestra comprensión profunda?

Criterios de calificación:
- 0 puntos: No demuestra conocimiento de las habilidades requeridas
- 1 punto: Demuestra conocimiento básico de las habilidades requeridas  
- 2 puntos: Demuestra conocimiento sólido y uso correcto de terminología técnica de las habilidades requeridas

Devuelve SOLO este JSON exacto sin texto adicional:
{"calificacion": 0, "comentario": "breve justificación"}

Respuesta del postulante: "${respuestaPostulante}"`;

    try {
      const evalRes = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            { 
              role: 'system', 
              content: 'Eres un evaluador técnico objetivo especializado en evaluar candidatos para vacantes específicas. Devuelve SOLO el JSON solicitado sin texto adicional.' 
            },
            { role: 'user', content: evalPrompt }
          ],
          temperature: 0.1,
          max_tokens: 100
        },
        { 
          headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
          timeout: 15000
        }
      );

      const responseText = evalRes.data.choices[0].message.content.trim();
      console.log('📊 Respuesta de evaluación:', responseText);
      
      // Limpiar la respuesta para extraer solo el JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        calificacionIA = Math.max(0, Math.min(2, parsed.calificacion || 0));
        comentarioIA = parsed.comentario || 'Evaluación completada.';
      } else {
        throw new Error('No se encontró JSON válido en la respuesta');
      }
      
      console.log('✅ Evaluación completada:', { calificacionIA, comentarioIA });
    } catch (error) {
      console.error('❌ Error al evaluar respuesta:', error.message);
      comentarioIA = 'Error en la evaluación automática.';
      calificacionIA = 0;
    }
  } else {
    comentarioIA = 'Sin respuesta del postulante.';
    calificacionIA = 0;
  }

  // Actualizar el registro existente de la ronda anterior
  try {
    const [updatedRows] = await db.PreguntaOral.update(
      {
        RespuestaPostulante: respuestaPostulante || null,
        CalificacionIA: calificacionIA,
        ComentarioIA: comentarioIA,
        TiempoRptaPostulante: tiempo
      },
      {
        where: {
          Id_Entrevista: idEntrevista,
          Ronda: parseInt(ronda)
        }
      }
    );

    if (updatedRows === 0) {
      console.warn(`⚠ No se actualizó ninguna fila para la ronda ${ronda}`);
    } else {
      console.log(`✅ Ronda ${ronda} actualizada correctamente`);
    }
  } catch (updateError) {
    console.error('❌ Error al actualizar ronda:', updateError.message);
    throw updateError;
  }
}

async function guardarPreguntaOral(ronda, preguntaGPT, respuestaPostulante, tiempo, idEntrevista) {
  let comentarioIA = '';

  if (ronda === '0') {
    comentarioIA = 'Presentación inicial del reclutador.';
  } else {
    comentarioIA = 'Pregunta pendiente de respuesta.';
  }

  try {
    const nuevaPregunta = await db.PreguntaOral.create({
      Ronda: parseInt(ronda),
      PreguntaIA: preguntaGPT,
      RespuestaPostulante: respuestaPostulante || null,
      CalificacionIA: 0, // Siempre 0 al crear, se actualiza después
      ComentarioIA: comentarioIA,
      Id_Entrevista: idEntrevista,
      TiempoRptaPostulante: tiempo
    });

    console.log(`✅ Pregunta ronda ${ronda} guardada con ID:`, nuevaPregunta.Id_Pregunta_oral);
    return nuevaPregunta;
  } catch (saveError) {
    console.error('❌ Error al guardar pregunta:', saveError.message);
    throw saveError;
  }
}

exports.getPreguntasOrales = async (req, res) => {
  const idEntrevista = parseInt(req.params.idEntrevista);
  
  console.log('📋 Obteniendo preguntas orales para entrevista:', idEntrevista);
  
  try {
    if (!idEntrevista || isNaN(idEntrevista)) {
      return res.status(400).json({ error: 'ID de entrevista inválido' });
    }

    const preguntas = await db.PreguntaOral.findAll({
      where: { Id_Entrevista: idEntrevista },
      order: [['Ronda', 'ASC']],
      attributes: [
        'Id_Pregunta_oral',
        'Ronda',
        'PreguntaIA',
        'RespuestaPostulante',
        'CalificacionIA',
        'ComentarioIA',
        'TiempoRptaPostulante'
      ]
    });

    const respuesta = preguntas.map(p => ({
      id: p.Id_Pregunta_oral,
      ronda: p.Ronda,
      pregunta: p.PreguntaIA,
      respuesta: p.RespuestaPostulante,
      calificacionIA: p.CalificacionIA,
      comentario: p.ComentarioIA,
      tiempo: p.TiempoRptaPostulante
    }));

    console.log(`✅ Se encontraron ${preguntas.length} preguntas orales`);
    res.json(respuesta);
  } catch (error) {
    console.error('❌ Error al obtener preguntas orales:', error.message);
    res.status(500).json({ error: 'Error al obtener preguntas orales', detalle: error.message });
  }
};