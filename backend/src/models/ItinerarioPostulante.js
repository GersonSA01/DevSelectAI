module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ItinerarioPostulante', {
    Id_ItinerarioPostulante: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Id_Postulante: {
      type: DataTypes.INTEGER
    },
    id_Itinerario: {
      type: DataTypes.INTEGER
    },
    Id_EstadoItinerario: {
      type: DataTypes.INTEGER
    },
    FechInicio: {
      type: DataTypes.DATE
    },
    FechFin: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'DAI_T_ItinerarioPostulante',
    timestamps: false
  });
};
