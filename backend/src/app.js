const express = require("express");
const path = require("path");
const app = express();

// Importar las rutas de Postulador
const postuladorRoutes = require("./routes/postuladorRoutes");

app.use(express.json());

// Ruta principal
app.get("/", (req, res) => {
  res.send("Bienvenido a DevSelectAI - Backend en funcionamiento");
});

// Usar rutas de postulador bajo /api/postulador
app.use("/api/postulador", postuladorRoutes);

module.exports = app;
