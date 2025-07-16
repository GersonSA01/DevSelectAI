const express = require("express");
const path = require("path");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");

const app = express();

const db = require("./models");
const cargarDatosIniciales = require("./script/cargarDatosIniciales");

// 🔷 Sincronizar base de datos
db.sequelize.sync({ force: false })
  .then(async () => {
    console.log("📦 Base de datos sincronizada con Sequelize (SQLite)");
    await cargarDatosIniciales();
  })
  .catch((err) => {
    console.error("❌ Error al sincronizar la base de datos:", err);
  });

// 🔷 Middlewares
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true, // 👈 necesario para cookies
  exposedHeaders: ['X-Respuesta-GPT']
}));

// 🔷 Ajuste de tamaño para JSON y URL-encoded para evitar 413
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(cookieParser()); // 👈 para leer cookies

// 🔷 Configurar fileUpload
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // límite de 50MB para archivos
  abortOnLimit: true,
  createParentPath: true
}));

// 🔷 Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔷 Rutas
app.use('/api/itinerarios', require("./routes/itinerario"));
app.use('/api/entrevista', require("./routes/entrevista"));
app.use('/api/postulante', require("./routes/postulante"));
app.use('/api/reclutador', require("./routes/reclutador"));
app.use('/api/excel', require("./routes/excel"));
app.use('/api/configuracion', require("./routes/configuracion"));
// app.use('/api/registro', require("./routes/registro"));
app.use('/api', require("./routes/login")); // login-postulante, login-reclutador, me, logout
app.use('/api/vacantes', require("./routes/vacante"));
app.use('/api/empresas', require("./routes/empresa"));
app.use('/api/habilidades', require("./routes/habilidad"));
app.use('/api/preguntas', require("./routes/preguntas"));
app.use('/api/opciones', require("./routes/opciones"));
app.use('/api/generar-preguntas', require("./routes/generarPreguntasIA"));
app.use('/api/evaluacion', require("./routes/evaluacion"));
app.use('/api/capturas', require("./routes/captureRoutes"));
app.use('/api/ciudades', require("./routes/ciudad"));
app.use('/api/informe', require("./routes/informe"));
app.use('/api/calificar', require("./routes/calificar"));
app.use('/api/programaciones', require("./routes/programaciones"));

// 🔷 Home
app.get("/", (req, res) => {
  res.send("🚀 Bienvenido a DevSelectAI - Backend en funcionamiento");
});

// 🔷 404
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

module.exports = app;
