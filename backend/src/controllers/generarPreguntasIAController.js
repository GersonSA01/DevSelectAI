const db = require('../models');
const axios = require('axios');

exports.generarPreguntas = async (req, res) => {
  const idVacante = parseInt(req.params.idVacante);

try {
  const vacante = await db.Vacante.findByPk(idVacante); // ✅ definir vacante

  if (!vacante) return res.status(404).json({ error: 'Vacante no encontrada' });



    const habilidades = await db.VacanteHabilidad.findAll({
      where: { Id_Vacante: idVacante },
      include: [{ model: db.Habilidad, as: 'habilidad' }]
    });

    const contexto = vacante.Contexto;
    const nombresHabilidades = habilidades
      .map(h => h.habilidad?.Descripcion)
      .filter(Boolean)
      .join(', ');

    const promptMultiple = `
Eres un experto en entrevistas técnicas. Crea 5 preguntas de opción múltiple para un estudiante basadas en las siguientes habilidades: ${nombresHabilidades}. El contexto del proyecto es: ${contexto}.
Para cada pregunta, da:
1. Una pregunta clara
2. Tres opciones: una correcta y dos incorrectas
3. Señala cuál es la correcta usando el texto exacto de la opción correcta.

Formato JSON esperado:
[
  {
    "pregunta": "¿Cuál es la salida de ...?",
    "opciones": ["opción A", "opción B", "opción C"],
    "correcta": "opción B"
  }, ...
]
`;
    console.log('🧠 Prompt opción múltiple:\n', promptMultiple);

    const resMultiple = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [{ role: 'user', content: promptMultiple }],
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const preguntas = JSON.parse(resMultiple.data.choices[0].message.content);
    console.log('✅ Respuesta Opción Múltiple:', preguntas);

    for (const p of preguntas.slice(0, 5)) {
      const nuevaPregunta = await db.Pregunta.create({
        Pregunta: p.pregunta,
        EsIA: true,
        Id_vacante: idVacante,
        FechCreacion: new Date()
      });

      for (const opcionTexto of p.opciones) {
        await db.Opcion.create({
          Opcion: opcionTexto,
          Correcta: opcionTexto.trim() === p.correcta.trim(),
          Id_Pregunta: nuevaPregunta.Id_Pregunta
        });
      }
    }

 const habilidadAleatoria = habilidades.length > 0
  ? habilidades[Math.floor(Math.random() * habilidades.length)].habilidad.Descripcion
  : 'JavaScript';

const promptTecnica = `
Eres un generador de preguntas técnicas de codificación para entrevistas a estudiantes universitarios.

Crea una pregunta técnica **fácil a intermedia** centrada exclusivamente en la habilidad: **${habilidadAleatoria}**.

Debe incluir:
- Un enunciado claro.
- Una pequeña guía o pista para resolverla.
- Una posible solución escrita en código.

Formato JSON exacto requerido (sin markdown):

{
  "pregunta": "Describe cómo implementar una función en ${habilidadAleatoria} que ... (aquí va el enunciado).\\n\\nPista: considera usar ...",
  "respuesta": "aquí_va_el_código_con_\\n_escapado"
}

Solo devuelve el JSON. NO incluyas explicaciones ni markdown. Escapa todos los saltos de línea con \\n y usa comillas dobles sin errores.
`;

    console.log('💻 Prompt técnica:\n', promptTecnica);

    const resTecnica = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [{ role: 'user', content: promptTecnica }],
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let raw = resTecnica.data.choices[0].message.content.trim();

    // Limpieza segura del JSON generado por IA
    let clean = raw
      .replace(/^```(json)?/, '') // elimina ```json o ```
      .replace(/```$/, '')        // elimina cierre ```
      .trim();

try {
  const tecnica = JSON.parse(resTecnica.data.choices[0].message.content.trim());

  if (!tecnica.pregunta || !tecnica.respuesta) {
    throw new Error('JSON técnico incompleto');
  }

  const nuevaPreguntaTecnica = await db.Pregunta.create({
    Pregunta: tecnica.pregunta,
    EsIA: true,
    Id_vacante: idVacante,
    FechCreacion: new Date()
  });

  await db.PreguntaTecnica.create({
    Id_Pregunta: nuevaPreguntaTecnica.Id_Pregunta,
    Respuesta: tecnica.respuesta,
    UsoIA: false
  });

  res.json({ mensaje: 'Preguntas guardadas correctamente.' });
} catch (error) {
  console.error('❌ Error al parsear respuesta técnica:', error.message);
  console.log('🔍 Contenido recibido:', resTecnica.data.choices[0].message.content);
  res.status(500).json({ error: 'Error al procesar la pregunta técnica' });
}


  } catch (error) {
    console.error('❌ Error general al generar preguntas:', error.message);
    res.status(500).json({ error: 'Error general al generar preguntas.' });
  }
};
