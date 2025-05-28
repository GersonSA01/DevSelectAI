module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Pais', {
    id_pais: { type: DataTypes.INTEGER, primaryKey: true },
    Descripcion: DataTypes.STRING
  }, {
    tableName: 'DAI_P_Pais',
    timestamps: false
  });
};