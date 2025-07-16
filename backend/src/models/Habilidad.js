module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Habilidad', {
    Id_Habilidad: { type: DataTypes.INTEGER, primaryKey: true },
    Descripcion: DataTypes.STRING,
    Activo: { type: DataTypes.BOOLEAN, defaultValue: true }

  }, {
    tableName: 'DAI_M_Habilidad',
    timestamps: false
  });
};