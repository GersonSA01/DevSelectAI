const { Vacante, VacanteHabilidad, Empresa, Pregunta, Habilidad } = require('../models');
const db = require('../models'); // ✅ Añadir esta línea

exports.getByItinerario = async (req, res) => {
  const { idItinerario } = req.params;

  try {
    const vacantes = await Vacante.findAll({
      where: { id_Itinerario: idItinerario },
      include: [
        { model: Empresa, as: 'empresa' },
        {
          model: VacanteHabilidad,
          as: 'habilidades',
          include: [{ model: Habilidad, as: 'habilidad' }]
        }
      ]
    });

    // 🔄 Transformar las habilidades anidadas a un array plano de habilidades
    const resultado = vacantes.map(v => {
      const habilidadesPlano = (v.habilidades || []).map(h => h.habilidad);
      return {
        ...v.toJSON(),
        Habilidades: habilidadesPlano
      };
    });

    console.log('📦 Vacantes mapeadas con habilidades:', resultado);
    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener vacantes:', error);
    res.status(500).json({ error: 'Error al obtener vacantes' });
  }
};



exports.crearVacante = async (req, res) => {
  try {
    console.log('📥 Datos recibidos:', req.body);

    const {
      Id_Itinerario,
      Descripcion,
      Cantidad,
      Contexto,
      Id_reclutador,
      Id_Empresa,
      habilidades
    } = req.body;

    if (
      Id_Itinerario == null || !Descripcion || Cantidad == null || !Contexto ||
      Id_reclutador == null || Id_Empresa == null || !Array.isArray(habilidades)
    ) {
      console.log('❌ Validación fallida:', {
        Id_Itinerario, Descripcion, Cantidad, Contexto,
        Id_reclutador, Id_Empresa, habilidades
      });
      return res.status(400).json({ error: 'Datos incompletos o inválidos' });
    }

    const nuevaVacante = await Vacante.create({
      id_Itinerario: Id_Itinerario,
      Descripcion,
      Contexto,
      Cantidad,
      CantidadUsoIA: 0,
      Id_Empresa,
      Id_reclutador,
    });

    if (habilidades.length > 0) {
      const vacanteHabilidades = habilidades.slice(0, 3).map(id => ({
        Id_Vacante: nuevaVacante.Id_Vacante,
        Id_Habilidad: id
      }));
      await VacanteHabilidad.bulkCreate(vacanteHabilidades);
    }

    res.status(201).json({ message: 'Vacante creada', vacante: nuevaVacante });
  } catch (error) {
    console.error('❌ Error al crear vacante:', error);
    res.status(500).json({ error: 'Error al crear la vacante', detalle: error.message });
  }
};

exports.getHabilidadesByVacante = async (req, res) => {
  try {
    const { idVacante } = req.params;

    const habilidades = await VacanteHabilidad.findAll({
      where: { Id_Vacante: idVacante },
      include: {
        model: Habilidad,
        as: 'habilidad',
        attributes: ['Id_Habilidad', 'Descripcion']
      }
    });

    const resultado = habilidades.map((item) => item.habilidad);
    res.json(resultado);
  } catch (error) {
    console.error('❌ Error al obtener habilidades de la vacante:', error);
    res.status(500).json({ error: 'Error al obtener habilidades' });
  }
};

exports.getById = async (req, res) => {
  const { id } = req.params;

  try {
    const vacante = await Vacante.findByPk(id, {
      include: [
        {
          model: VacanteHabilidad,
          as: 'habilidades',
          include: [{ model: Habilidad, as: 'habilidad' }]
        },
        { model: Empresa, as: 'empresa' }
      ]
    });

    if (!vacante) return res.status(404).json({ error: 'Vacante no encontrada' });

    const habilidades = vacante.habilidades.map(vh => vh.Id_Habilidad);
    res.json({ ...vacante.toJSON(), habilidades });
  } catch (error) {
    console.error('❌ Error al obtener vacante:', error);
    res.status(500).json({ error: 'Error al obtener vacante' });
  }
};

exports.actualizarVacante = async (req, res) => {
  const { id } = req.params;
  const {
    Id_Itinerario,
    Descripcion,
    Cantidad,
    Contexto,
    Id_reclutador,
    Id_Empresa,
    habilidades
  } = req.body;

  try {
    const vacante = await Vacante.findByPk(id);
    if (!vacante) return res.status(404).json({ error: 'Vacante no encontrada' });

    await vacante.update({
      id_Itinerario: Id_Itinerario,
      Descripcion,
      Contexto,
      Cantidad,
      Id_Empresa,
      Id_reclutador,
    });

    await VacanteHabilidad.destroy({ where: { Id_Vacante: id } });

    if (Array.isArray(habilidades)) {
      const nuevas = habilidades.slice(0, 3).map(idHabilidad => ({
        Id_Vacante: id,
        Id_Habilidad: idHabilidad
      }));
      await VacanteHabilidad.bulkCreate(nuevas);
    }

    res.json({ mensaje: 'Vacante actualizada correctamente.' });
  } catch (error) {
    console.error('❌ Error al actualizar vacante:', error);
    res.status(500).json({ error: 'Error al actualizar vacante' });
  }
};

exports.eliminarVacante = async (req, res) => {
  const { id } = req.params;

  try {
    const preguntas = await Pregunta.findAll({ where: { Id_vacante: id } });

    if (preguntas.length > 0) {
      return res.status(400).json({ mensaje: 'No se puede eliminar la vacante porque tiene preguntas asociadas.' });
    }

    await VacanteHabilidad.destroy({ where: { Id_Vacante: id } });
    await Vacante.destroy({ where: { Id_Vacante: id } });

    res.json({ mensaje: 'Vacante eliminada correctamente.' });
  } catch (error) {
    console.error('❌ Error al eliminar vacante:', error);
    res.status(500).json({ error: 'Error al eliminar la vacante' });
  }
};

exports.getVacantesPorHabilidades = async (req, res) => {
  const { habilidades, idPostulante } = req.body;

  if (!Array.isArray(habilidades) || habilidades.length === 0 || !idPostulante) {
    return res.status(400).json({ error: 'Se requieren habilidades válidas y el ID del postulante.' });
  }

  try {
    // Obtener el itinerario como texto plano desde el postulante
    const postulante = await db.Postulante.findByPk(idPostulante);
    if (!postulante || !postulante.Itinerario) {
      return res.status(404).json({ error: 'Postulante no encontrado o sin itinerario.' });
    }

    // Extraer número desde "Itinerario 2" → 2
    const match = postulante.Itinerario.match(/Itinerario\s*(\d+)/i);
    const idItinerario = match ? parseInt(match[1]) : null;

    if (!idItinerario) {
      return res.status(400).json({ error: 'No se pudo interpretar el itinerario.' });
    }

    // Buscar vacantes con coincidencia de habilidades + itinerario
    const vacantes = await db.Vacante.findAll({
      where: { id_Itinerario: idItinerario },
      include: [
        {
          model: db.VacanteHabilidad,
          as: 'habilidades',
          required: true,
          where: { Id_Habilidad: habilidades },
          include: [{ model: db.Habilidad, as: 'habilidad' }]
        },
        {
          model: db.Empresa,
          as: 'empresa'
        },
        {
          model: db.Itinerario,
          as: 'itinerario'
        }
      ]
    });

    res.json(vacantes);
  } catch (error) {
    console.error('❌ Error al obtener vacantes por habilidades + itinerario:', error);
    res.status(500).json({ error: 'Error al buscar vacantes' });
  }
};
