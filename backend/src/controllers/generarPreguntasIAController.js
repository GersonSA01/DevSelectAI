const db = require('../models');
const axios = require('axios');

exports.generarPreguntas = async (req, res) => {
  const idVacante = parseInt(req.params.idVacante);
  const { cantidadTeoricas = 5, cantidadTecnicas = 1 } = req.body; // valores dinámicos

  try {
    const vacante = await db.Vacante.findByPk(idVacante);

    if (!vacante) {
      return res.status(404).json({ error: 'Vacante no encontrada' });
    }

    if (vacante.CantidadUsoIA >= 3) {
      return res.status(400).json({ error: 'Límite de generación por IA alcanzado para esta vacante.' });
    }

    await vacante.update({ CantidadUsoIA: vacante.CantidadUsoIA + 1 });

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
Eres un experto en entrevistas técnicas. Crea ${cantidadTeoricas} preguntas de opción múltiple para un estudiante basadas en las siguientes habilidades: ${nombresHabilidades}. El contexto del proyecto es: ${contexto}.
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

    for (const p of preguntas.slice(0, cantidadTeoricas)) {
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

    // generar técnicas según cantidadTecnicas
    for (let i = 0; i < cantidadTecnicas; i++) {
      const habilidadAleatoria = habilidades.length > 0
        ? habilidades[Math.floor(Math.random() * habilidades.length)].habilidad.Descripcion
        : 'JavaScript';

      const promptTecnica = `
Eres un generador de preguntas técnicas de codificación para entrevistas a estudiantes universitarios.
Crea una pregunta técnica fácil o intermedia centrada exclusivamente en la habilidad: ${habilidadAleatoria}.
Incluye:
- Un enunciado claro.
- Una pequeña pista para resolverla.
- Una posible solución en código.

Formato JSON exacto requerido (sin markdown):
{
  "pregunta": "Describe cómo implementar una función en ${habilidadAleatoria} que ...",
  "respuesta": "aquí_va_el_código_con_\\n_escapado"
}
`;

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

      const tecnica = JSON.parse(resTecnica.data.choices[0].message.content.trim());

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
    }

    res.json({ mensaje: 'Preguntas generadas correctamente.' });

  } catch (error) {
    console.error('❌ Error general al generar preguntas:', error.message);
    res.status(500).json({ error: 'Error al generar preguntas.' });
  }
};
