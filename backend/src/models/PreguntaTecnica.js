module.exports = (sequelize, DataTypes) => {
  return sequelize.define('PreguntaTecnica', {
    Id_PreguntaTecnica: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Respuesta: {
      type: DataTypes.TEXT 
    },    
    Id_Pregunta: {
      type: DataTypes.INTEGER
    }
  }, {
    tableName: 'DAI_P_PreguntaTecnica',
    timestamps: false
  });
};
