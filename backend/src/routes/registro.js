const express = require("express");
const router = express.Router();
const db = require("../models");

router.post("/", async (req, res) => {
  const { cedula, nombre, apellido, correo, telefono, contrasena, rol } = req.body;

  try {
    if (rol.toLowerCase() === "estudiante") {
      const nuevo = await db.Postulante.create({
        Cedula: cedula,
        Nombre: nombre,
        Apellido: apellido,
        Correo: correo,
        Telefono: telefono,
        Contrasena: contrasena,
        FechPostulacion: new Date(),
        id_EstadoPostulacion: 1
      });
      return res.status(201).json(nuevo);
    }

    if (rol.toLowerCase() === "docente") {
      const nuevo = await db.Reclutador.create({
        Cedula: cedula,
        Nombres: nombre + " " + apellido,
        Correo: correo,
        Telefono: telefono,
        Contrasena: contrasena
      });
      return res.status(201).json(nuevo);
    }

    res.status(400).json({ error: "Rol no reconocido" });
  } catch (error) {
    console.error("Error al registrar:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

module.exports = router;
