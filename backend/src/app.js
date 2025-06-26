const express = require("express");
const path = require("path");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const app = express();

// 📦 BASE DE DATOS
const db = require("./models");
const cargarDatosIniciales = require("./script/cargarDatosIniciales");

db.sequelize.sync({ force: false })
  .then(async () => {
    console.log("📦 Base de datos sincronizada con Sequelize (SQLite)");
    await cargarDatosIniciales();
  })
  .catch((err) => {
    console.error("❌ Error al sincronizar la base de datos:", err);
  });

// 🔐 MIDDLEWARES
app.use(cors({
  origin: 'http://localhost:3000',
  exposedHeaders: ['X-Respuesta-GPT']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔗 RUTAS IMPORTADAS
const entrevistaRoutes = require("./routes/entrevista");
const postulanteRoutes = require("./routes/postulante");
const reclutadorRoutes = require("./routes/reclutador");
const excelRoutes = require("./routes/excel");
const configuracionRoutes = require('./routes/configuracion');
const registroRoutes = require("./routes/registro");
const loginRoutes = require("./routes/login");
const itinerarioRoutes = require('./routes/itinerario');
const vacanteRoutes = require('./routes/vacante');
const empresaRoutes = require('./routes/empresa');
const habilidadRoutes = require('./routes/habilidad');
const preguntasRoutes = require('./routes/preguntas');
const opcionesRoutes = require("./routes/opciones");
const generarPreguntasRoutes = require('./routes/generarPreguntasIA');
const evaluacionRoutes = require('./routes/evaluacion');
const captureRoutes = require('./routes/captureRoutes');
const ciudadRoutes = require('./routes/ciudad');
const informeRoutes = require('./routes/informe');
const calificarRoutes = require('./routes/calificar');
// 🚦 USO DE RUTAS
app.use('/api/itinerarios', itinerarioRoutes);
app.use('/api/entrevista', entrevistaRoutes);
app.use('/api/postulante', postulanteRoutes);
app.use('/api/reclutador', reclutadorRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/configuracion', configuracionRoutes);
app.use('/api/registro', registroRoutes);
app.use('/api', loginRoutes);
app.use('/api/vacantes', vacanteRoutes);
app.use('/api/empresas', empresaRoutes);
app.use('/api/habilidades', habilidadRoutes);
app.use('/api/preguntas', preguntasRoutes);
app.use('/api/opciones', opcionesRoutes);
app.use('/api/generar-preguntas', generarPreguntasRoutes);
app.use('/api/evaluacion', evaluacionRoutes);
app.use('/api/capturas', captureRoutes); // Ruta correcta
app.use('/api/ciudades', ciudadRoutes);
app.use('/api/informe', informeRoutes);
app.use("/api/calificar", calificarRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// 🌐 RUTA PRINCIPAL
app.get("/", (req, res) => {
  res.send("🚀 Bienvenido a DevSelectAI - Backend en funcionamiento");
});

// ⚠️ RUTA NO ENCONTRADA
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

module.exports = app;
