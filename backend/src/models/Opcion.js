module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Opcion', {
    Id_Opcion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Opcion: {
      type: DataTypes.STRING(300)
    },
    Correcta: {
      type: DataTypes.BOOLEAN
    },
    Id_Pregunta: {
      type: DataTypes.INTEGER
    }
  }, {
    tableName: 'DAI_P_Opcion',
    timestamps: false
  });
};
