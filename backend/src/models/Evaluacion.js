module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Evaluacion', {
    id_Evaluacion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true // ✅ Esto es lo que faltaba
    },
    ObservacionGeneral: DataTypes.STRING,
    PuntajeTotal: DataTypes.DECIMAL(10, 2),
    Id_Entrevista: DataTypes.INTEGER,
    Id_postulante: DataTypes.INTEGER
  }, {
    tableName: 'DAI_T_Evaluacion',
    timestamps: false
  });
};
