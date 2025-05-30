const { Reclutador } = require("../models");

exports.crearReclutador = async (req, res) => {
  try {
    console.log("Datos recibidos (reclutador):", req.body); // 🧪 DEBUG

    const { Cedula, Nombres, Apellidos, Correo, Telefono, Contrasena } = req.body;

    if (!Cedula || !Nombres || !Apellidos || !Correo || !Telefono || !Contrasena) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    const nuevo = await Reclutador.create({
      Cedula,
      Nombres,
      Apellidos,
      Correo,
      Telefono,
      Contrasena,
    });

    res.status(201).json(nuevo);
  } catch (error) {
    console.error("❌ Error al crear reclutador:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
