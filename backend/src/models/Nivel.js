module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Nivel', {
    id_Nivel: { type: DataTypes.INTEGER, primaryKey: true },
    descripcion: DataTypes.STRING
  }, {
    tableName: 'DAI_P_Nivel',
    timestamps: false
  });
};