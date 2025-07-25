module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Empresa', {
    Id_Empresa: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Descripcion: DataTypes.STRING,
    Activo: { type: DataTypes.BOOLEAN, defaultValue: true }

  }, {
    tableName: 'DAI_M_Empresa',
    timestamps: false
  });
};