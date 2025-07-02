module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Programacion', {
    id_Programacion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    FechIniPostulacion: {
      type: DataTypes.DATE,
      allowNull: false
    },
    FechFinPostulacion: {
      type: DataTypes.DATE,
      allowNull: false
    },
    FechIniAprobacion: {
      type: DataTypes.DATE,
      allowNull: false
    },
    FechFinAprobacion: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'DAI_P_Programacion',
    timestamps: false
  });
};
