const db = require('../models');
const provinciasData = require('./pais.json');

async function cargarDatosIniciales() {
  try {
    await db.sequelize.sync();

    // Estados de postulación
    const estados = await db.EstadoPostulacion.findAll();
    if (estados.length === 0) {
      await db.EstadoPostulacion.bulkCreate([
        { id_EstadoPostulacion: 1, descripcion: 'Por evaluar' },
        { id_EstadoPostulacion: 2, descripcion: 'Evaluado' },
        { id_EstadoPostulacion: 3, descripcion: 'Aprobado' },
        { id_EstadoPostulacion: 4, descripcion: 'Rechazado' }
      ]);
      console.log('✅ Estados de postulación insertados.');
    }

    // Itinerarios
    const itinerarios = await db.Itinerario.findAll();
    if (itinerarios.length === 0) {
      await db.Itinerario.bulkCreate([
        { id_Itinerario: 1, descripcion: 'Itinerario 1: Análisis de entorno para agropecuaria, turismo e industria' },
        { id_Itinerario: 2, descripcion: 'Itinerario 2: Desarrollo de Aplicaciones' }
      ]);
      console.log('✅ Itinerarios insertados.');
    }

    // Empresa UNEMI
    const empresas = await db.Empresa.findAll();
    if (empresas.length === 0) {
      await db.Empresa.create({ Descripcion: 'UNEMI' });
      console.log('✅ Empresa UNEMI insertada.');
    }

    // País, provincias y ciudades
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

    console.log('🚀 Carga de datos iniciales completada.');
  } catch (err) {
    console.error('❌ Error al cargar datos iniciales:', err.message);
  }
}

module.exports = cargarDatosIniciales;
