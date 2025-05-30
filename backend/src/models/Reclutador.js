// models/Reclutador.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Reclutador", {
    Id_Reclutador: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Cedula: DataTypes.STRING(10),
    Nombres: DataTypes.STRING,
    Apellidos: DataTypes.STRING,
    Correo: DataTypes.STRING,
    Telefono: DataTypes.STRING(13),
    Contrasena: DataTypes.STRING,
    Id_Area: DataTypes.INTEGER
  }, {
    tableName: "DAI_M_Reclutador",
    timestamps: false
  });
};
