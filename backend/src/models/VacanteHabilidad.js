module.exports = (sequelize, DataTypes) => {
  return sequelize.define('VacanteHabilidad', {
    Id_VacanteHabilidad: { type: DataTypes.INTEGER, primaryKey: true },
    Id_Vacante: DataTypes.INTEGER,
    Id_Habilidad: DataTypes.INTEGER
  }, {
    tableName: 'DAI_T_VacanteHabilidad',
    timestamps: false
  });
};