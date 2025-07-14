module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Capture', {
    id_Capture: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_Evaluacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    File: {
      type: DataTypes.STRING, 
    },
    Aprobado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    Observacion: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
     Calificacion: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
  }, {
    tableName: 'DAI_T_Capture',
    timestamps: false
  });
};
