const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("../models");

require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "mi_clave_secreta";


router.post("/login-postulante", async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    const postulante = await db.Postulante.findOne({
      where: { Correo: correo }
    });

    if (!postulante) {
      return res.status(401).json({ mensaje: "Credenciales incorrectas" });
    }

    const isValid = await bcrypt.compare(contrasena, postulante.Contrasena);
    if (!isValid) {
      return res.status(401).json({ mensaje: "Credenciales incorrectas" });
    }

    const token = jwt.sign(
      {
        id: postulante.Id_Postulante,
        nombres: `${postulante.Nombre} ${postulante.Apellido}`,
        correo: postulante.Correo,
        rol: "estudiante"
      },
      JWT_SECRET,
      { expiresIn: "4h" }
    );

    res.json({ token });
  } catch (error) {
    console.error("Error al iniciar sesión postulante:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});


router.post("/login-reclutador", async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    const reclutador = await db.Reclutador.findOne({
      where: { Correo: correo }
    });

    if (!reclutador) {
      return res.status(401).json({ mensaje: "Credenciales incorrectas" });
    }

    const isValid = await bcrypt.compare(contrasena, reclutador.Contrasena);
    if (!isValid) {
      return res.status(401).json({ mensaje: "Credenciales incorrectas" });
    }

    const token = jwt.sign(
      {
        id: reclutador.Id_Reclutador,
        nombres: `${reclutador.Nombres} ${reclutador.Apellidos}`,
        correo: reclutador.Correo,
        rol: "docente"
      },
      JWT_SECRET,
      { expiresIn: "4h" }
    );

    res.json({ token });
  } catch (error) {
    console.error("Error al iniciar sesión reclutador:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

module.exports = router;
