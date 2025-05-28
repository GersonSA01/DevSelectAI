const express = require("express");
const router = express.Router();
const db = require("../models");

// LOGIN para POSTULANTE
router.post("/login-postulante", async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    const postulante = await db.Postulante.findOne({
      where: { Correo: correo, Contrasena: contrasena }
    });

    if (!postulante) {
      return res.status(401).json({ mensaje: "Credenciales incorrectas" });
    }

    res.json({
      id: postulante.Id_Postulante,
      nombres: `${postulante.Nombre} ${postulante.Apellido}`,
      correo: postulante.Correo,
      rol: "estudiante"
    });
  } catch (error) {
    console.error("Error al iniciar sesión postulante:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// LOGIN para RECLUTADOR
router.post("/login-reclutador", async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    const reclutador = await db.Reclutador.findOne({
      where: { Correo: correo, Contrasena: contrasena }
    });

    if (!reclutador) {
      return res.status(401).json({ mensaje: "Credenciales incorrectas" });
    }

    res.json({
      id: reclutador.Id_Reclutador,
      nombres: `${reclutador.Nombres} ${reclutador.Apellidos}`,
      correo: reclutador.Correo,
      rol: "docente"
    });
  } catch (error) {
    console.error("Error al iniciar sesión reclutador:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

module.exports = router;
