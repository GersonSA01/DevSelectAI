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
      type: DataTypes.STRING, // Puedes usar TEXT si es base64 o ruta larga
    },
    Aprobado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    Observacion: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  }, {
    tableName: 'DAI_T_Capture',
    timestamps: false
  });
};
