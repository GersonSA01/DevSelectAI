const express = require("express");
const path = require("path");
const cors = require("cors");
const fileUpload = require("express-fileupload"); // Necesario si manejas audio

const app = express();

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000', // Asegúrate de que coincida con tu frontend
  exposedHeaders: ['X-Respuesta-GPT']
}));
app.use(express.json()); // Para JSON
app.use(express.urlencoded({ extended: true })); // Para formularios
app.use(fileUpload()); // Para subir archivos tipo audio

// Importar las rutas de entrevista
const entrevistaRoutes = require("./routes/entrevista");

// Ruta principal
app.get("/", (req, res) => {
  res.send("🚀 Bienvenido a DevSelectAI - Backend en funcionamiento");
});

// Rutas de API
app.use("/api/entrevista", entrevistaRoutes); // Aquí usas la ruta para procesar audio

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

module.exports = app;
