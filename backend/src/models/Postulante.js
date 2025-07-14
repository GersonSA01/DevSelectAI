module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Postulante', {
    Id_Postulante: { type: DataTypes.INTEGER, primaryKey: true,  autoIncrement: true },
    Cedula: DataTypes.STRING(10),
    Nombre: DataTypes.STRING,
    Apellido: DataTypes.STRING,
    Correo: DataTypes.STRING,
    Telefono: DataTypes.STRING(13),
    Contrasena: DataTypes.STRING,
    FechPostulacion: DataTypes.DATE,
    id_ciudad: DataTypes.INTEGER,
    id_EstadoPostulacion: DataTypes.INTEGER,
    token_entrevista: DataTypes.STRING
  }, {
    tableName: 'DAI_M_Postulante',
    timestamps: false
  });
};
