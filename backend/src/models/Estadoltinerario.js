module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Estadoltinerario', {
    Id_EstadoItinerario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Descripcion: {
      type: DataTypes.STRING(200)
    }
  }, {
    tableName: 'DAI_P_EstadoItinerario',
    timestamps: false
  });
};
