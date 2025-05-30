const express = require("express");
const path = require("path");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const app = express();

// === 🔗 SEQUELIZE CONFIGURACIÓN ===
const db = require("./models");

db.sequelize.sync({ force: false })
  .then(() => {
    console.log("📦 Base de datos sincronizada con Sequelize (SQLite)");
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

// ✅ IMPORTACIÓN DE RUTAS
const entrevistaRoutes = require("./routes/entrevista");
const postulanteRoutes = require("./routes/postulante"); // corregido singular
const reclutadorRoutes = require("./routes/reclutador"); // nuevo
const excelRoutes = require("./routes/excel");
const configuracionRoutes = require('./routes/configuracion');
const registroRoutes = require("./routes/registro");
const loginRoutes = require("./routes/login");
const itinerarioRoutes = require('./routes/itinerario');
const vacanteRoutes = require('./routes/vacante');
const empresaRouter = require('./routes/empresa');
const nivelRouter = require('./routes/nivel');
const habilidadRouter = require('./routes/habilidad');



// ✅ USO DE RUTAS
app.use('/api/itinerarios', itinerarioRoutes);
app.use("/api/entrevista", entrevistaRoutes);
app.use("/api/postulante", postulanteRoutes);   // ✅ endpoint corregido
app.use("/api/reclutador", reclutadorRoutes);   // ✅ endpoint nuevo
app.use("/api/excel", excelRoutes);
app.use('/api/configuracion', configuracionRoutes);
app.use("/api/registro", registroRoutes);
app.use('/api', loginRoutes);
app.use('/api/vacantes', vacanteRoutes);
app.use('/api/empresas', empresaRouter);
app.use('/api/niveles', nivelRouter);
app.use('/api/habilidades', habilidadRouter);

// ✅ RUTA PRINCIPAL
app.get("/", (req, res) => {
  res.send("🚀 Bienvenido a DevSelectAI - Backend en funcionamiento");
});

// ✅ RUTA NO ENCONTRADA
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

module.exports = app;
