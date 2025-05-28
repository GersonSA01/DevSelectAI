module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Provincia', {
    id_provincia: { type: DataTypes.INTEGER, primaryKey: true },
    id_pais: DataTypes.INTEGER,
    Descripcion: DataTypes.STRING
  }, {
    tableName: 'DAI_P_Provincia',
    timestamps: false
  });
};