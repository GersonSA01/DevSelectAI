module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Area', {
    Id_Area: { type: DataTypes.INTEGER, primaryKey: true },
    descripcion: DataTypes.STRING
  }, {
    tableName: 'DAI_P_Area',
    timestamps: false
  });
};