const { Sequelize } = require('sequelize');
const config = require('../../config/config.json');
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Registrar modelos
db.PostulanteVacante = require('./PostulanteVacante')(sequelize, Sequelize);
db.Capture = require('./Capture')(sequelize, Sequelize);
db.Ciudad = require('./Ciudad')(sequelize, Sequelize);
db.DetalleHabilidad = require('./DetalleHabilidad')(sequelize, Sequelize);
db.Empresa = require('./Empresa')(sequelize, Sequelize);
db.EntrevistaOral = require('./EntrevistaOral')(sequelize, Sequelize);
db.EstadoPostulacion = require('./EstadoPostulacion')(sequelize, Sequelize);
db.Evaluacion = require('./Evaluacion')(sequelize, Sequelize);
db.Habilidad = require('./Habilidad')(sequelize, Sequelize);
db.Itinerario = require('./Itinerario')(sequelize, Sequelize);
db.Pais = require('./Pais')(sequelize, Sequelize);
db.Postulante = require('./Postulante')(sequelize, Sequelize);
db.Pregunta = require('./Pregunta')(sequelize, Sequelize);
db.PreguntaOral = require('./PreguntaOral')(sequelize, Sequelize);
db.Provincia = require('./Provincia')(sequelize, Sequelize);
db.Reclutador = require('./Reclutador')(sequelize, Sequelize);
db.Vacante = require('./Vacante')(sequelize, Sequelize);
db.VacanteHabilidad = require('./VacanteHabilidad')(sequelize, Sequelize);
db.Opcion = require('./Opcion')(sequelize, Sequelize);
db.PreguntaTecnica = require('./PreguntaTecnica')(sequelize, Sequelize);

// Relaciones

db.DetalleHabilidad.belongsTo(db.Habilidad, { foreignKey: 'Id_Habilidad' });
db.Postulante.hasMany(db.DetalleHabilidad, { foreignKey: 'Id_Postulante' });
db.DetalleHabilidad.belongsTo(db.Postulante, { foreignKey: 'Id_Postulante' });
db.Evaluacion.hasMany(db.Capture, { foreignKey: 'id_Evaluacion' });
db.Capture.belongsTo(db.Evaluacion, { foreignKey: 'id_Evaluacion' });

// Postulante - Ciudad - EstadoPostulacion
db.Postulante.belongsTo(db.Ciudad, {
  foreignKey: 'id_ciudad',
  as: 'ciudad'
});
db.Ciudad.hasMany(db.Postulante, {
  foreignKey: 'id_ciudad',
  as: 'postulantes'
});

db.Postulante.belongsTo(db.EstadoPostulacion, {
  foreignKey: 'id_EstadoPostulacion',
  as: 'estadoPostulacion'
});
db.EstadoPostulacion.hasMany(db.Postulante, {
  foreignKey: 'id_EstadoPostulacion',
  as: 'postulantes'
});

// Vacante - Empresa - Reclutador - Itinerario
db.Vacante.belongsTo(db.Empresa, {
  foreignKey: 'Id_Empresa',
  as: 'empresa'
});
db.Empresa.hasMany(db.Vacante, {
  foreignKey: 'Id_Empresa',
  as: 'vacantes'
});

db.Vacante.belongsTo(db.Reclutador, {
  foreignKey: 'Id_reclutador',
  as: 'reclutador'
});
db.Reclutador.hasMany(db.Vacante, {
  foreignKey: 'Id_reclutador',
  as: 'vacantes'
});

db.Vacante.belongsTo(db.Itinerario, {
  foreignKey: 'id_Itinerario',
  as: 'itinerario'
});
db.Itinerario.hasMany(db.Vacante, {
  foreignKey: 'id_Itinerario',
  as: 'vacantes'
});

// VacanteHabilidad - Vacante - Habilidad
db.VacanteHabilidad.belongsTo(db.Vacante, {
  foreignKey: 'Id_Vacante',
  as: 'vacante'
});
db.Vacante.hasMany(db.VacanteHabilidad, {
  foreignKey: 'Id_Vacante',
  as: 'habilidades'
});

db.VacanteHabilidad.belongsTo(db.Habilidad, {
  foreignKey: 'Id_Habilidad',
  as: 'habilidad'
});
db.Habilidad.hasMany(db.VacanteHabilidad, {
  foreignKey: 'Id_Habilidad',
  as: 'vacantes'
});

// DetalleHabilidad - Postulante - Habilidad
db.DetalleHabilidad.belongsTo(db.Postulante, {
  foreignKey: 'Id_Postulante',
  as: 'postulante'
});
db.Postulante.hasMany(db.DetalleHabilidad, {
  foreignKey: 'Id_Postulante',
  as: 'habilidades'
});

db.DetalleHabilidad.belongsTo(db.Habilidad, {
  foreignKey: 'Id_Habilidad',
  as: 'habilidad'
});
db.Habilidad.hasMany(db.DetalleHabilidad, {
  foreignKey: 'Id_Habilidad',
  as: 'detalles'
});

// Vacante - Pregunta
db.Vacante.hasMany(db.Pregunta, {
  foreignKey: 'Id_vacante',
  as: 'preguntas'
});
db.Pregunta.belongsTo(db.Vacante, {
  foreignKey: 'Id_vacante',
  as: 'vacante'
});

// Evaluacion - Pregunta - Postulante
db.Evaluacion.belongsTo(db.Pregunta, {
  foreignKey: 'Id_pregunta',
  as: 'pregunta'
});
db.Pregunta.hasMany(db.Evaluacion, {
  foreignKey: 'Id_pregunta',
  as: 'evaluaciones'
});

db.Evaluacion.belongsTo(db.Postulante, {
  foreignKey: 'Id_postulante',
  as: 'postulante'
});
db.Postulante.hasMany(db.Evaluacion, {
  foreignKey: 'Id_postulante',
  as: 'evaluaciones'
});

// EntrevistaOral - Evaluacion
db.Evaluacion.belongsTo(db.EntrevistaOral, {
  foreignKey: 'Id_Entrevista',
  as: 'entrevista'
});
db.EntrevistaOral.hasOne(db.Evaluacion, {
  foreignKey: 'Id_Entrevista',
  as: 'evaluacion'
});

// PreguntaOral - EntrevistaOral
db.PreguntaOral.belongsTo(db.EntrevistaOral, {
  foreignKey: 'Id_Entrevista',
  as: 'entrevista'
});
db.EntrevistaOral.hasMany(db.PreguntaOral, {
  foreignKey: 'Id_Entrevista',
  as: 'preguntasOrales'
});

// Geografía: Ciudad - Provincia - País
db.Ciudad.belongsTo(db.Provincia, {
  foreignKey: 'id_provincia',
  as: 'provincia'
});
db.Provincia.hasMany(db.Ciudad, {
  foreignKey: 'id_provincia',
  as: 'ciudades'
});

db.Provincia.belongsTo(db.Pais, {
  foreignKey: 'id_pais',
  as: 'pais'
});
db.Pais.hasMany(db.Provincia, {
  foreignKey: 'id_pais',
  as: 'provincias'
});

// Pregunta - Opcion
db.Pregunta.hasMany(db.Opcion, {
  foreignKey: 'Id_Pregunta',
  as: 'opciones'
});
db.Opcion.belongsTo(db.Pregunta, {
  foreignKey: 'Id_Pregunta',
  as: 'pregunta'
});

// Pregunta - PreguntaTecnica
db.Pregunta.hasOne(db.PreguntaTecnica, {
  foreignKey: 'Id_Pregunta',
  as: 'preguntaTecnica'
});
db.PreguntaTecnica.belongsTo(db.Pregunta, {
  foreignKey: 'Id_Pregunta',
  as: 'pregunta'
});

// Asociaciones adicionales
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.PostulanteVacante.belongsTo(db.Postulante, {
  foreignKey: 'Id_Postulante',
  as: 'postulante'
});

db.PostulanteVacante.belongsTo(db.Vacante, {
  foreignKey: 'Id_Vacante',
  as: 'vacante'
});

db.Postulante.hasMany(db.PostulanteVacante, {
  foreignKey: 'Id_Postulante',
  as: 'selecciones'
});
db.Vacante.hasMany(db.PostulanteVacante, {
  foreignKey: 'Id_Vacante',
  as: 'postulantesSeleccionados'
});

// ✅ Evaluacion - Capture SOLO UNA VEZ

db.Evaluacion.hasMany(db.Capture, {
  foreignKey: 'id_Evaluacion',
  as: 'captures'
});
db.Capture.belongsTo(db.Evaluacion, {
  foreignKey: 'id_Evaluacion',
  as: 'evaluacion'
});

module.exports = db;
