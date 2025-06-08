module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Ciudad', {
    id_ciudad: { type: DataTypes.INTEGER, primaryKey: true },
    Descripcion: DataTypes.STRING,
    id_provincia: DataTypes.INTEGER
  }, {
    tableName: 'DAI_P_CIudad',
    timestamps: false
  });
};