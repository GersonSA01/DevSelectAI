module.exports = (sequelize, DataTypes) => {
  return sequelize.define('PostulanteVacante', {
    Id_PostulanteVacante: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Id_Postulante: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Id_Vacante: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    FechaSeleccion: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'DAI_T_PostulanteVacante',
    timestamps: false
  });
};
