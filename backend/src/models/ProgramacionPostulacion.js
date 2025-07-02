module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ProgramacionPostulacion', {
    id_ProgramacionPostulacion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Id_Vacante: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_Programacion: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    CantAprobados: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    CantRechazados: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    tableName: 'ProgramacionPostulacion',
    timestamps: false
  });
};
