
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('PreguntaEvaluacion', {
    id_PreguntaEvaluacion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    RptaPostulante: {
      type: DataTypes.STRING(500)
    },
    Puntaje: {
      type: DataTypes.INTEGER
    },
    id_Evaluacion: {
      type: DataTypes.INTEGER
    },
    Id_Pregunta: {
      type: DataTypes.INTEGER
    },
    UsoIA: {
      type: DataTypes.INTEGER
    },
    TiempoRptaPostulante: {
      type: DataTypes.INTEGER
    }
  }, {
    tableName: 'DAI_T_PreguntaEvaluacion',
    timestamps: false
  });
};
