module.exports = (sequelize, DataTypes) => {
  return sequelize.define('EstadoPostulacion', {
    id_EstadoPostulacion: { type: DataTypes.INTEGER, primaryKey: true },
    descripcion: DataTypes.STRING
  }, {
    tableName: 'DAI_P_EstadoPostulacion',
    timestamps: false
  });
};