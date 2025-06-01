module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Vacante', {
    Id_Vacante: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Descripcion: DataTypes.STRING,
    Contexto: DataTypes.TEXT,
    Cantidad: DataTypes.INTEGER,
    CantidadUsoIA: DataTypes.INTEGER,
    Id_Empresa: DataTypes.INTEGER,
    Id_reclutador: DataTypes.INTEGER,
    id_nivel: DataTypes.INTEGER,
    id_Itinerario: DataTypes.INTEGER
  }, {
    tableName: 'DAI_T_Vacante',
    timestamps: false
  });
};