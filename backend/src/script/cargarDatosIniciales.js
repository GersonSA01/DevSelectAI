const db = require('../models');
const provinciasData = require('./pais.json');

async function cargarDatosIniciales() {
  try {
    await db.sequelize.sync();

    
    const estados = await db.EstadoPostulacion.findAll();
    if (estados.length === 0) {
      await db.Habilidad.bulkCreate([
  { Id_Habilidad: 1, Descripcion: 'SQL', Activo: true },
  { Id_Habilidad: 2, Descripcion: 'Machine Learning', Activo: true },
  { Id_Habilidad: 3, Descripcion: 'Python', Activo: true },
  { Id_Habilidad: 4, Descripcion: 'NodeJS', Activo: true },
  { Id_Habilidad: 5, Descripcion: 'NextJS', Activo: true },
  { Id_Habilidad: 6, Descripcion: 'React', Activo: true }
]);

      console.log('✅ Estados de postulación insertados.');
    }

    
    const itinerarios = await db.Itinerario.findAll();
    if (itinerarios.length === 0) {
      await db.Itinerario.bulkCreate([
  { id_Itinerario: 1, descripcion: 'Itinerario 1: Análisis de entorno para agropecuaria, turismo e industria', Activo: true },
  { id_Itinerario: 2, descripcion: 'Itinerario 2: Desarrollo de Aplicaciones', Activo: true }
]);

      console.log('✅ Itinerarios insertados.');
    }

    
    const empresas = await db.Empresa.findAll();
    if (empresas.length === 0) {
      await db.Empresa.create({ Descripcion: 'UNEMI', Activo: true });
      console.log('✅ Empresa UNEMI insertada.');
    }

    
    const paisExistente = await db.Pais.findByPk(1);
    if (!paisExistente) {
      const pais = await db.Pais.create({ id_pais: 1, Descripcion: 'ECUADOR' });
      console.log('✅ País ECUADOR insertado.');

      for (const [i, provinciaObj] of provinciasData.entries()) {
        const provincia = await db.Provincia.create({
          id_provincia: i + 1,
          id_pais: pais.id_pais,
          Descripcion: provinciaObj.name
        });

        for (const [j, ciudadObj] of provinciaObj.cities.entries()) {
          await db.Ciudad.create({
            id_ciudad: i * 100 + j + 1,
            id_provincia: provincia.id_provincia,
            Descripcion: ciudadObj.name
          });
        }
      }

      console.log('✅ Provincias y ciudades de Ecuador insertadas.');
    }

        // Habilidades
    const habilidades = await db.Habilidad.findAll();
    if (habilidades.length === 0) {
      await db.Habilidad.bulkCreate([
        { Id_Habilidad: 1, Descripcion: 'SQL' },
        { Id_Habilidad: 2, Descripcion: 'Machine Learning' },
        { Id_Habilidad: 3, Descripcion: 'Python' },
        { Id_Habilidad: 4, Descripcion: 'NodeJS' },
        { Id_Habilidad: 5, Descripcion: 'NextJS' },
        { Id_Habilidad: 6, Descripcion: 'React' }
      ]);
      console.log('✅ Habilidades insertadas.');
    }

    
    const estadosItinerario = await db.Estadoltinerario.findAll();
    if (estadosItinerario.length === 0) {
      await db.Estadoltinerario.bulkCreate([
        { Id_EstadoItinerario: 1, Descripcion: 'Pendiente' },
        { Id_EstadoItinerario: 2, Descripcion: 'En curso' },
        { Id_EstadoItinerario: 3, Descripcion: 'Finalizado' }
      ]);
      console.log('✅ Estados de itinerario insertados.');
    }


    console.log('🚀 Carga de datos iniciales completada.');
  } catch (err) {
    console.error('❌ Error al cargar datos iniciales:', err.message);
  }
}

module.exports = cargarDatosIniciales;
