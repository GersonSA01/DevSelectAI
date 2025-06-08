module.exports = (sequelize, DataTypes) => {
  return sequelize.define('EntrevistaOral', {
    Id_Entrevista: { type: DataTypes.INTEGER, primaryKey: true },
    Id_Postulante: DataTypes.INTEGER,
    RetroalimentacionIA: DataTypes.STRING
  }, {
    tableName: 'DAI_T_Entrevista_oral',
    timestamps: false
  });
};