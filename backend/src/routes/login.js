const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("../models");

require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "mi_clave_secreta";

// POSTULANTE
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

    const payload = {
      id: postulante.Id_Postulante,
      nombres: `${postulante.Nombre} ${postulante.Apellido}`,
      correo: postulante.Correo,
      rol: "postulante"
    };

    console.log("🎫 JWT Payload POSTULANTE:", payload);

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "4h" });

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 4 * 60 * 60 * 1000 // 4 horas
    });

    res.json({ mensaje: "Login exitoso (postulante)" });
  } catch (error) {
    console.error("Error al iniciar sesión postulante:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// RECLUTADOR
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

    const payload = {
      id: reclutador.Id_Reclutador,
      nombres: `${reclutador.Nombres} ${reclutador.Apellidos}`,
      correo: reclutador.Correo,
      rol: "reclutador"
    };

    console.log("🎫 JWT Payload RECLUTADOR:", payload);

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "4h" });

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 4 * 60 * 60 * 1000 // 4 horas
    });

    res.json({ mensaje: "Login exitoso (reclutador)" });
  } catch (error) {
    console.error("Error al iniciar sesión reclutador:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

module.exports = router;
