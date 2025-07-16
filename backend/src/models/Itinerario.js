module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Itinerario', {
    id_Itinerario: { type: DataTypes.INTEGER, primaryKey: true },
    descripcion: DataTypes.STRING,
    Activo: { type: DataTypes.BOOLEAN, defaultValue: true }

  }, {
    tableName: 'DAI_P_Itinerario',
    timestamps: false
  });
};