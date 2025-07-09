const {
  Vacante,
  VacanteHabilidad,
  Empresa,
  Pregunta,
  Habilidad,
  ProgramacionPostulacion,
  Programacion
} = require('../models');
const db = require('../models');
const { Op } = require('sequelize');

// 🚀 NUEVA función: Vacantes por habilidades
exports.getVacantesPorHabilidades = async (req, res) => {
  const { habilidades, idPostulante } = req.body;

  if (!Array.isArray(habilidades) || habilidades.length === 0 || !idPostulante) {
    return res.status(400).json({ error: 'Se requieren habilidades válidas y el ID del postulante.' });
  }

  try {
    const relacion = await db.ItinerarioPostulante.findOne({
      where: { Id_Postulante: idPostulante },
      include: [{ model: db.Itinerario, as: 'itinerario' }]
    });

    if (!relacion || !relacion.itinerario) {
      return res.status(404).json({ error: 'Postulante no tiene un itinerario asignado.' });
    }

    const idItinerario = relacion.itinerario.id_Itinerario;

    const vacantes = await Vacante.findAll({
      where: { id_Itinerario: idItinerario },
      include: [
        {
          model: VacanteHabilidad,
          as: 'habilidades',
          required: true,
          where: { Id_Habilidad: habilidades },
          include: [
            { model: Habilidad, as: 'habilidad' }
          ]
        },
        {
          model: ProgramacionPostulacion,
          as: 'programacionesPostulacion',
          include: [
            { model: Programacion, as: 'programacion' }
          ]
        },
        {
          model: Empresa,
          as: 'empresa'
        },
        {
          model: db.Itinerario,
          as: 'itinerario'
        }
      ]
    });

    const resultado = vacantes.map(v => {
      const habilidadesPlano = (v.habilidades || []).map(h => ({
        Id_Habilidad: h.Id_Habilidad,
        Descripcion: h.habilidad?.Descripcion || 'Sin descripción'
      }));
      const programacion = v.programacionesPostulacion?.[0]?.programacion;

      return {
        Id_Vacante: v.Id_Vacante,
        Descripcion: v.Descripcion,
        Contexto: v.Contexto,
        Habilidades: habilidadesPlano,
        Programacion: programacion
          ? {
              FechIniPostulacion: programacion.FechIniPostulacion,
              FechFinPostulacion: programacion.FechFinPostulacion,
              FechIniAprobacion: programacion.FechIniAprobacion,
              FechFinAprobacion: programacion.FechFinAprobacion
            }
          : null
      };
    });

    res.json(resultado);

  } catch (error) {
    console.error('❌ Error al obtener vacantes por habilidades + itinerario:', error);
    res.status(500).json({ error: 'Error al buscar vacantes' });
  }
};

exports.getByItinerario = async (req, res) => {
  const { idItinerario } = req.params;

  try {
    const vacantes = await db.Vacante.findAll({
      where: { id_Itinerario: idItinerario },
      include: [
        { model: db.Empresa, as: 'empresa' },
        {
          model: db.VacanteHabilidad,
          as: 'habilidades',
          include: [{ model: db.Habilidad, as: 'habilidad' }]
        },
        {
          model: db.ProgramacionPostulacion,
          as: 'programacionesPostulacion', // <-- alias correcto
          include: [
            {
              model: db.Programacion,
              as: 'programacion'
            }
          ]
        }
      ]
    });

    // Transformar las habilidades y programaciones
    const resultado = vacantes.map(v => {
      const habilidadesPlano = (v.habilidades || []).map(h => h.habilidad);
      // Tomar la primera programación asociada (ajusta si hay varias)
      const programacion = v.programacionesPostulacion?.[0]?.programacion;
      return {
        ...v.toJSON(),
        Habilidades: habilidadesPlano,
        Programacion: programacion
          ? {
              id_Programacion: programacion.id_Programacion,
              FechIniPostulacion: programacion.FechIniPostulacion,
              FechFinPostulacion: programacion.FechFinPostulacion,
              FechIniAprobacion: programacion.FechIniAprobacion,
              FechFinAprobacion: programacion.FechFinAprobacion,
              rangoPostulacion: programacion.rangoPostulacion,
              rangoAprobacion: programacion.rangoAprobacion
            }
          : null
      };
    });

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener vacantes:', error);
    res.status(500).json({ error: 'Error al obtener vacantes' });
  }
};


exports.crearVacante = async (req, res) => {
  try {
    const {
      Id_Itinerario, Descripcion, Cantidad, Contexto,
      Id_reclutador, Id_Empresa, habilidades, Id_Programacion
    } = req.body;

    if (
      Id_Itinerario == null || !Descripcion || Cantidad == null || !Contexto ||
      Id_reclutador == null || Id_Empresa == null || !Array.isArray(habilidades)
    ) {
      return res.status(400).json({ error: 'Datos incompletos o inválidos.' });
    }

    if (habilidades.length === 0 || habilidades.length > 3) {
      return res.status(400).json({ error: 'Debe seleccionar entre 1 y 3 habilidades.' });
    }

    if (!Id_Programacion) {
      return res.status(400).json({ error: 'Debe seleccionar una programación.' });
    }

    const programacion = await Programacion.findByPk(Id_Programacion);
    if (!programacion) {
      return res.status(400).json({ error: 'Programación no encontrada.' });
    }

    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const fechaIni = new Date(programacion.FechIniPostulacion);
    fechaIni.setHours(0,0,0,0);
    if (fechaIni < hoy) {
      return res.status(400).json({ error: 'No se puede asignar una programación que ya inició.' });
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

    await VacanteHabilidad.bulkCreate(
      habilidades.slice(0, 3).map(id => ({
        Id_Vacante: nuevaVacante.Id_Vacante,
        Id_Habilidad: id
      }))
    );

    await ProgramacionPostulacion.create({
      Id_Vacante: nuevaVacante.Id_Vacante,
      id_Programacion: Id_Programacion,
      CantAprobados: 0,
      CantRechazados: 0
    });

    res.status(201).json({ message: 'Vacante creada', vacante: nuevaVacante });
  } catch (error) {
    console.error('❌ Error al crear vacante:', error);
    res.status(500).json({ error: 'Error al crear la vacante', detalle: error.message });
  }
};

exports.actualizarVacante = async (req, res) => {
  const { id } = req.params;
  const {
    Id_Itinerario, Descripcion, Cantidad, Contexto,
    Id_reclutador, Id_Empresa, habilidades
  } = req.body;

  try {
    if (
      Id_Itinerario == null || !Descripcion || Cantidad == null || !Contexto ||
      Id_reclutador == null || Id_Empresa == null || !Array.isArray(habilidades)
    ) {
      return res.status(400).json({ error: 'Datos incompletos o inválidos.' });
    }

    if (habilidades.length === 0 || habilidades.length > 3) {
      return res.status(400).json({ error: 'Debe seleccionar entre 1 y 3 habilidades.' });
    }

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
    await VacanteHabilidad.bulkCreate(
      habilidades.slice(0, 3).map(idHabilidad => ({
        Id_Vacante: id,
        Id_Habilidad: idHabilidad
      }))
    );

    res.json({ mensaje: 'Vacante actualizada correctamente.' });
  } catch (error) {
    console.error('❌ Error al actualizar vacante:', error);
    res.status(500).json({ error: 'Error al actualizar vacante' });
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

    res.json(habilidades.map(h => h.habilidad));
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
    const programacion = await ProgramacionPostulacion.findOne({
      where: { Id_Vacante: id }
    });

    res.json({
      ...vacante.toJSON(),
      habilidades,
      Id_Programacion: programacion?.id_Programacion || null
    });
  } catch (error) {
    console.error('❌ Error al obtener vacante:', error);
    res.status(500).json({ error: 'Error al obtener vacante' });
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
    await ProgramacionPostulacion.destroy({ where: { Id_Vacante: id } });
    await Vacante.destroy({ where: { Id_Vacante: id } });

    res.json({ mensaje: 'Vacante eliminada correctamente.' });
  } catch (error) {
    console.error('❌ Error al eliminar vacante:', error);
    res.status(500).json({ error: 'Error al eliminar la vacante' });
  }
};


exports.asignarVacante = async (req, res) => {
  const { idPostulante, idVacante } = req.body;

  if (!idPostulante || !idVacante) {
    return res.status(400).json({ error: 'Se requieren idPostulante e idVacante.' });
  }

  try {
    // Verificar que el postulante exista
    const postulante = await db.Postulante.findByPk(idPostulante);
    if (!postulante) {
      return res.status(404).json({ error: 'Postulante no encontrado.' });
    }

    // Verificar que la vacante exista
    const vacante = await Vacante.findByPk(idVacante);
    if (!vacante) {
      return res.status(404).json({ error: 'Vacante no encontrada.' });
    }

    // Buscar la ProgramacionPostulacion para esa vacante
    const programacionPostulacion = await ProgramacionPostulacion.findOne({
      where: { Id_Vacante: idVacante }
    });

    if (!programacionPostulacion) {
      return res.status(404).json({ error: 'No se encontró una programación para la vacante seleccionada.' });
    }

    console.log('✅ ProgramacionPostulacion encontrada:', programacionPostulacion.toJSON());

    // Determinar el nombre correcto de la clave primaria
    const idProgramacionPostulacion =
      programacionPostulacion.Id_ProgramacionPostulacion ||
      programacionPostulacion.id ||
      programacionPostulacion.id_ProgramacionPostulacion;

    if (!idProgramacionPostulacion) {
      return res.status(500).json({ error: 'No se pudo determinar el id de la ProgramacionPostulacion.' });
    }

    // Verificar que el postulante no esté ya asignado a esa vacante
    const yaAsignado = await db.PostulanteVacante.findOne({
      where: {
        Id_Postulante: idPostulante,
        Id_Vacante: idVacante
      }
    });

    if (yaAsignado) {
      return res.status(400).json({ error: 'El postulante ya está asignado a esta vacante.' });
    }

    // Crear la asignación
    const asignacion = await db.PostulanteVacante.create({
      Id_Postulante: idPostulante,
      Id_Vacante: idVacante,
      id_ProgramacionPostulacion: idProgramacionPostulacion,
      FechaSeleccion: new Date()
    });

    res.status(201).json({
      message: 'Vacante asignada correctamente.',
      asignacion
    });

  } catch (error) {
    console.error('❌ Error al asignar vacante:', error);
    res.status(500).json({ error: 'Error al asignar vacante', detalle: error.message });
  }
};




