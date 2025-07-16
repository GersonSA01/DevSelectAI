const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("../models");

const JWT_SECRET = process.env.JWT_SECRET || "mi_clave_secreta";

router.post("/login-postulante", async (req, res) => {
  const { correo, contrasena } = req.body;
  const postulante = await db.Postulante.findOne({ where: { Correo: correo } });
  if (!postulante) {
    return res.status(401).json({ mensaje: "Credenciales incorrectas" });
  }

  const isValid = await bcrypt.compare(contrasena, postulante.Contrasena);
  if (!isValid) {
    return res.status(401).json({ mensaje: "Credenciales incorrectas" });
  }

  const payload = {
    id: postulante.Id_Postulante,
    nombres: `${postulante.Nombre} ${postulante.Apellido}`.trim(),
    correo: postulante.Correo,
    rol: "postulante"
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "4h" });

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 4 * 60 * 60 * 1000
  });

  res.json({ 
    mensaje: "Login exitoso (postulante)", 
    nombres: payload.nombres 
  });
});


router.post("/login-reclutador", async (req, res) => {
  const { correo, contrasena } = req.body;
  const reclutador = await db.Reclutador.findOne({ where: { Correo: correo } });
  if (!reclutador) {
    return res.status(401).json({ mensaje: "Credenciales incorrectas" });
  }

  const isValid = await bcrypt.compare(contrasena, reclutador.Contrasena);
  if (!isValid) {
    return res.status(401).json({ mensaje: "Credenciales incorrectas" });
  }

  const payload = {
    id: reclutador.Id_Reclutador,
    nombres: `${reclutador.Nombres} ${reclutador.Apellidos}`.trim(),
    correo: reclutador.Correo,
    rol: "reclutador"
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "4h" });

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 4 * 60 * 60 * 1000
  });

  res.json({ 
    mensaje: "Login exitoso (reclutador)", 
    nombres: payload.nombres 
  });
});

router.get("/me", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ mensaje: "No autenticado" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ usuario: decoded });
  } catch (error) {
    console.error("❌ Token inválido o expirado:", error);
    res.status(401).json({ mensaje: "Token inválido o expirado" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
  });
  res.json({ mensaje: "Sesión cerrada" });
});

module.exports = router;
