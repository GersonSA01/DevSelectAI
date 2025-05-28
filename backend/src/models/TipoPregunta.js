module.exports = (sequelize, DataTypes) => {
  return sequelize.define('TipoPregunta', {
    Id_TipoPregunta: { type: DataTypes.INTEGER, primaryKey: true },
    Descripcion: DataTypes.STRING
  }, {
    tableName: 'DAI_P_TipoPregunta',
    timestamps: false
  });
};