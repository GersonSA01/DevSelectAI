const { Reclutador } = require("../models");

exports.crearReclutador = async (req, res) => {
  try {
    const { Cedula, Nombres, Apellidos, Correo, Telefono, Contrasena } = req.body;

    if (!Cedula || !Nombres || !Apellidos || !Correo || !Telefono || !Contrasena) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    if (!/^\d{10}$/.test(Cedula)) {
      return res.status(400).json({ error: "Cédula inválida (10 dígitos requeridos)" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Correo)) {
      return res.status(400).json({ error: "Correo inválido" });
    }

    if (Contrasena.length < 8) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres" });
    }

    const nuevo = await Reclutador.create({ Cedula, Nombres, Apellidos, Correo, Telefono, Contrasena });

    res.status(201).json(nuevo);
  } catch (error) {
    console.error("❌ Error al crear reclutador:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
