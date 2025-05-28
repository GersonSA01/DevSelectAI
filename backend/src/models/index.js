const { Sequelize } = require('sequelize');
const config = require('../../config/config.json');
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Registrar modelos
db.Area = require('./Area')(sequelize, Sequelize);
db.Ciudad = require('./Ciudad')(sequelize, Sequelize);
db.DetalleHabilidad = require('./DetalleHabilidad')(sequelize, Sequelize);
db.Empresa = require('./Empresa')(sequelize, Sequelize);
db.EntrevistaOral = require('./EntrevistaOral')(sequelize, Sequelize);
db.EstadoPostulacion = require('./EstadoPostulacion')(sequelize, Sequelize);
db.Evaluacion = require('./Evaluacion')(sequelize, Sequelize);
db.Habilidad = require('./Habilidad')(sequelize, Sequelize);
db.Itinerario = require('./Itinerario')(sequelize, Sequelize);
db.Nivel = require('./Nivel')(sequelize, Sequelize);
db.Pais = require('./Pais')(sequelize, Sequelize);
db.Postulante = require('./Postulante')(sequelize, Sequelize);
db.Pregunta = require('./Pregunta')(sequelize, Sequelize);
db.PreguntaOral = require('./PreguntaOral')(sequelize, Sequelize);
db.Provincia = require('./Provincia')(sequelize, Sequelize);
db.Reclutador = require('./Reclutador')(sequelize, Sequelize);
db.TipoPregunta = require('./TipoPregunta')(sequelize, Sequelize);
db.Vacante = require('./Vacante')(sequelize, Sequelize);
db.VacanteHabilidad = require('./VacanteHabilidad')(sequelize, Sequelize);

// Relaciones explícitas
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

// Asociaciones adicionales si existen
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
