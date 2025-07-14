const { Programacion } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const programaciones = await Programacion.findAll();

    const formatear = (fecha) => {
  const d = new Date(fecha);

  
  d.setHours(d.getHours() + 5);

  return new Intl.DateTimeFormat('es-EC', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(d);
};


    const resultado = programaciones.map(p => ({
      id_Programacion: p.id_Programacion,
      FechIniPostulacion: p.FechIniPostulacion,
      FechFinPostulacion: p.FechFinPostulacion,
      FechIniAprobacion: p.FechIniAprobacion,
      FechFinAprobacion: p.FechFinAprobacion,
      rangoPostulacion: `${formatear(p.FechIniPostulacion)} → ${formatear(p.FechFinPostulacion)}`,
      rangoAprobacion: `${formatear(p.FechIniAprobacion)} → ${formatear(p.FechFinAprobacion)}`
    }));

    res.json(resultado);
  } catch (err) {
    console.error('Error al obtener programaciones:', err);
    res.status(500).json({ error: 'Error al obtener programaciones' });
  }
};
