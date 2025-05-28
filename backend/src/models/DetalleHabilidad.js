module.exports = (sequelize, DataTypes) => {
  return sequelize.define('DetalleHabilidad', {
    Id_DetalleHabilidad: { type: DataTypes.INTEGER, primaryKey: true },
    Id_Postulante: DataTypes.INTEGER,
    Id_Habilidad: DataTypes.INTEGER
  }, {
    tableName: 'DAI_T_DetalleHabilidad',
    timestamps: false
  });
};