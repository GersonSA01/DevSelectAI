const express = require("express");
const XLSX = require("xlsx");
const path = require("path");
const router = express.Router();

router.get("/:cedula", (req, res) => {
  const cedula = req.params.cedula;
  const rutaArchivo = path.join(__dirname, "../../uploads/Estudiantes_UNEMI_Rol.xlsx");

  try {
    const workbook = XLSX.readFile(rutaArchivo);
    const hoja = workbook.Sheets[workbook.SheetNames[0]];
    const datos = XLSX.utils.sheet_to_json(hoja);

    const estudiante = datos.find(est => est.Cedula.toString() === cedula);

    if (!estudiante) {
      return res.status(404).json({ mensaje: "Estudiante no encontrado" });
    }

    res.json(estudiante);
  } catch (error) {
    console.error("❌ Error leyendo Excel:", error);
    res.status(500).json({ error: "Error leyendo el archivo Excel" });
  }
});

module.exports = router;
