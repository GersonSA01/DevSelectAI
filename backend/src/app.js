const express = require("express");
const path = require("path");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const app = express();

const db = require("./models");
const cargarDatosIniciales = require("./script/cargarDatosIniciales"); // ✅ importa la nueva función

// === 🔗 SEQUELIZE CONFIGURACIÓN ===
db.sequelize.sync({ force: false })
  .then(async () => {
    console.log("📦 Base de datos sincronizada con Sequelize (SQLite)");
    await cargarDatosIniciales(); // ✅ ejecuta carga inicial
  })
  .catch((err) => {
    console.error("❌ Error al sincronizar la base de datos:", err);
  });

// === 🔐 MIDDLEWARES ===
app.use(cors({
  origin: 'http://localhost:3000',
  exposedHeaders: ['X-Respuesta-GPT']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ IMPORTACIÓN DE RUTAS
const entrevistaRoutes = require("./routes/entrevista");
const postulanteRoutes = require("./routes/postulante");
const reclutadorRoutes = require("./routes/reclutador");
const excelRoutes = require("./routes/excel");
const configuracionRoutes = require('./routes/configuracion');
const registroRoutes = require("./routes/registro");
const loginRoutes = require("./routes/login");
const itinerarioRoutes = require('./routes/itinerario');
const vacanteRoutes = require('./routes/vacante');
const empresaRouter = require('./routes/empresa');
const habilidadRouter = require('./routes/habilidad');
const preguntasRoutes = require('./routes/preguntas');
const opcionesRoutes = require("./routes/opciones");
const generarPreguntasRouter = require('./routes/generarPreguntasIA');
const evaluacion = require('./routes/evaluacion');
const captureRoutes = require('./routes/capture');
const ciudadRoutes = require('./routes/ciudad');
const informeRoutes = require('./routes/informe');


// ✅ USO DE RUTAS
app.use('/api/itinerarios', itinerarioRoutes);
app.use("/api/entrevista", entrevistaRoutes);
app.use("/api/postulante", postulanteRoutes);
app.use("/api/reclutador", reclutadorRoutes);
app.use("/api/excel", excelRoutes);
app.use('/api/configuracion', configuracionRoutes);
app.use("/api/registro", registroRoutes);
app.use('/api', loginRoutes);
app.use('/api/vacantes', vacanteRoutes);
app.use('/api/empresas', empresaRouter);
app.use('/api/habilidades', habilidadRouter);
app.use('/api/preguntas', preguntasRoutes);
app.use('/api/opciones', opcionesRoutes);
app.use('/api/generar-preguntas', generarPreguntasRouter);
app.use('/api/evaluacion', evaluacion);
app.use('/api/captures', captureRoutes);
app.use('/api/ciudades', ciudadRoutes);
app.use('/api/informe', informeRoutes);
// ✅ RUTA PRINCIPAL
app.get("/", (req, res) => {
  res.send("🚀 Bienvenido a DevSelectAI - Backend en funcionamiento");
});

// ✅ RUTA NO ENCONTRADA
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

module.exports = app;
