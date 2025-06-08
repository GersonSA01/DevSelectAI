module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Evaluacion', {
    id_Evaluacion: { type: DataTypes.INTEGER, primaryKey: true },
    RptaPostulante: DataTypes.STRING,
    Puntaje: DataTypes.INTEGER,
    ObservacionGeneral: DataTypes.STRING,
    Id_pregunta: DataTypes.INTEGER,
    Id_postulante: DataTypes.INTEGER
  }, {
    tableName: 'DAI_T_Evaluacion',
    timestamps: false
  });
};