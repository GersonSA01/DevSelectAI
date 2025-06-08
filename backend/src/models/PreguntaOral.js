module.exports = (sequelize, DataTypes) => {
  return sequelize.define('PreguntaOral', {
    Id_Pregunta_oral: { type: DataTypes.INTEGER, primaryKey: true },
    Ronda: DataTypes.INTEGER,
    PreguntaIA: DataTypes.STRING,
    RespuestaPostulante: DataTypes.STRING,
    CalificacionIA: DataTypes.INTEGER,
    Id_Entrevista: DataTypes.INTEGER,
    TiempoRptaPostulante: DataTypes.INTEGER,
  }, {
    tableName: 'DAI_T_Pregunta_oral',
    timestamps: false
  });
};