module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Pregunta', {
    Id_Pregunta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    FechCreacion: {
      type: DataTypes.DATE
    },
    Pregunta: {
      type: DataTypes.STRING(500)
    },
    EsIA: {
      type: DataTypes.BOOLEAN
    },    
    TiempoLimite: {
    type: DataTypes.INTEGER
    },
    Id_vacante: {
      type: DataTypes.INTEGER
    }
  }, {
    tableName: 'DAI_M_Pregunta',
    timestamps: false
  });
};
