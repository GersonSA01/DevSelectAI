// src/controllers/postulanteController.js
const db = require('../models');
const Postulante = db.Postulante;

exports.crearPostulante = async (req, res) => {
  try {
    const { cedula, nombres, correo, telefono, contrasena } = req.body;

    const nuevoPostulante = await Postulante.create({
      Cedula: cedula,
      Nombres: nombres,
      Correo: correo,
      Telefono: telefono,
      Contrasena: contrasena,
    });

    res.status(201).json({ mensaje: "Postulante registrado correctamente", data: nuevoPostulante });
  } catch (error) {
    console.error("Error al registrar postulante:", error);
    res.status(500).json({ error: "Error al registrar postulante" });
  }
};
