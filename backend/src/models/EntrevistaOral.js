module.exports = (sequelize, DataTypes) => {
  return sequelize.define('EntrevistaOral', {
    Id_Entrevista: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    RetroalimentacionIA: DataTypes.STRING
  }, {
    tableName: 'DAI_T_Entrevista_oral',
    timestamps: false
  });
};