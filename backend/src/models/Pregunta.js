module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Pregunta', {
    Id_Pregunta: { type: DataTypes.INTEGER, primaryKey: true },
    FechCreacion: DataTypes.DATE,
    Pregunta: DataTypes.STRING,
    RptaPregunta: DataTypes.STRING,
    Id_vacante: DataTypes.INTEGER,
    Id_TipoPregunta: DataTypes.INTEGER
  }, {
    tableName: 'DAI_M_Pregunta',
    timestamps: false
  });
};