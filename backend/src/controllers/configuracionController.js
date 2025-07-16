const { Empresa, Habilidad, Itinerario, Programacion, Vacante, Pregunta, VacanteHabilidad, DetalleHabilidad, ProgramacionPostulacion, PostulanteVacante, PreguntaEvaluacion } = require('../models');

const modelos = {
  empresa: Empresa,
  habilidad: Habilidad,
  itinerario: Itinerario,
  programacion: Programacion,
  vacante: Vacante,
  pregunta: Pregunta
};

const dependencias = {
  empresa: [{ modelo: Vacante, clave: 'Id_Empresa' }],
  itinerario: [{ modelo: Vacante, clave: 'id_Itinerario' }],
  habilidad: [
    { modelo: VacanteHabilidad, clave: 'Id_Habilidad' },
    { modelo: DetalleHabilidad, clave: 'Id_Habilidad' }
  ],
  programacion: [{ modelo: ProgramacionPostulacion, clave: 'id_Programacion' }],
  vacante: [
    { modelo: Pregunta, clave: 'Id_vacante' },
    { modelo: PostulanteVacante, clave: 'Id_Vacante' },
    { modelo: VacanteHabilidad, clave: 'Id_Vacante' },
    { modelo: ProgramacionPostulacion, clave: 'Id_Vacante' }
  ],
  pregunta: [
    { modelo: PreguntaEvaluacion, clave: 'Id_Pregunta' }
  ]
};

function obtenerModelo(entidad) {
  const nombre = entidad?.toLowerCase();
  return modelos[nombre] || null;
}

exports.listar = async (req, res) => {
  const Modelo = obtenerModelo(req.params.entidad);
  if (!Modelo) return res.status(400).json({ error: 'Entidad no válida' });

  try {
    const registros = await Modelo.findAll({ where: { Activo: true } });
    res.json(registros);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.crear = async (req, res) => {
  const Modelo = obtenerModelo(req.params.entidad);
  if (!Modelo) return res.status(400).json({ error: 'Entidad no válida' });

  try {
    const nuevo = await Modelo.create(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.actualizar = async (req, res) => {
  const { entidad, id } = req.params;
  const Modelo = obtenerModelo(entidad);
  if (!Modelo) return res.status(400).json({ error: 'Entidad no válida' });

  try {
    const clave = Object.keys(Modelo.primaryKeys)[0];
    await Modelo.update(req.body, { where: { [clave]: id } });

    const actualizado = await Modelo.findOne({ where: { [clave]: id } });
    res.json(actualizado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.eliminar = async (req, res) => {
  const { entidad, id } = req.params;
  const Modelo = obtenerModelo(entidad);
  if (!Modelo) return res.status(400).json({ error: 'Entidad no válida' });

  try {
    const clave = Object.keys(Modelo.primaryKeys)[0];

    const deps = dependencias[entidad] || [];
    for (const { modelo, clave: claveHijo } of deps) {
      const count = await modelo.count({ where: { [claveHijo]: id, Activo: true } });
      if (count > 0) {
        return res.status(400).json({
          error: `No se puede desactivar porque existen ${count} registros relacionados en ${modelo.name}.`
        });
      }
    }

    await Modelo.update({ Activo: false }, { where: { [clave]: id } });
    res.json({ mensaje: 'Registro desactivado correctamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
