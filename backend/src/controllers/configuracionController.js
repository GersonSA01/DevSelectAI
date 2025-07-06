const { Empresa, Habilidad, Itinerario, Programacion } = require('../models');

// Mapeo de entidades a modelos
const modelos = {
  empresa: Empresa,
  habilidad: Habilidad,
  itinerario: Itinerario,
  programacion: Programacion,
}
// 🔍 Validar entidad y retornar modelo
function obtenerModelo(entidad) {
  const nombre = entidad?.toLowerCase();
  return modelos[nombre] || null;
}

// 📄 Listar todos
exports.listar = async (req, res) => {
  const Modelo = obtenerModelo(req.params.entidad);
  if (!Modelo) return res.status(400).json({ error: 'Entidad no válida' });

  try {
    const registros = await Modelo.findAll();
    res.json(registros);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➕ Crear
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

// 📝 Actualizar
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

// 🗑️ Eliminar
exports.eliminar = async (req, res) => {
  const { entidad, id } = req.params;
  const Modelo = obtenerModelo(entidad);
  if (!Modelo) return res.status(400).json({ error: 'Entidad no válida' });

  try {
    const clave = Object.keys(Modelo.primaryKeys)[0];
    const eliminado = await Modelo.destroy({ where: { [clave]: id } });
    res.json({ eliminado });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
