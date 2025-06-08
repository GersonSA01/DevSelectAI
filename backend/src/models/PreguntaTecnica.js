module.exports = (sequelize, DataTypes) => {
  return sequelize.define('PreguntaTecnica', {
    Id_PreguntaTecnica: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Respuesta: {
      type: DataTypes.TEXT // Para código, se recomienda usar TEXT
    },
    UsoIA: {
      type: DataTypes.BOOLEAN
    },
    Id_Pregunta: {
      type: DataTypes.INTEGER
    }
  }, {
    tableName: 'DAI_P_PreguntaTecnica',
    timestamps: false
  });
};
