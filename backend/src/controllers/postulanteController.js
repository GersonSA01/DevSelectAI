const { Postulante } = require("../models");

exports.crearPostulante = async (req, res) => {
  try {
    const { Cedula, Nombre, Apellido, Correo, Telefono, Contrasena } = req.body;

    if (!Cedula || !Nombre || !Apellido || !Correo || !Telefono || !Contrasena) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    const nuevo = await Postulante.create({
      Cedula,
      Nombre,
      Apellido,
      Correo,
      Telefono,
      Contrasena,
      ayuda: false,               // valores por defecto
      cant_alert: 0,
      FechPostulacion: new Date(),
      id_ciudad: null,
      id_EstadoPostulacion: 1     // o el valor por defecto que tengas
    });

    res.status(201).json(nuevo);
  } catch (error) {
    console.error("❌ Error al crear postulante:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
