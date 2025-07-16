module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Programacion', {
    id_Programacion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    FechIniPostulacion: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    FechFinPostulacion: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    FechIniAprobacion: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    FechFinAprobacion: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    Activo: { type: DataTypes.BOOLEAN, defaultValue: true }

  }, {
    tableName: 'DAI_P_Programacion',
    timestamps: false
  });
};
