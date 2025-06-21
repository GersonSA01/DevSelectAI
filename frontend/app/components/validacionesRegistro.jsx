import { Alert } from "./alerts/Alerts";

export async function validarCamposRegistro({ contrasena, confirmarContrasena, carrera, itinerario, ciudades, ciudadNombre }) {
  if (contrasena !== confirmarContrasena) {
    await Alert({ title: "Contraseñas no coinciden", html: "Verifica que ambas contraseñas sean iguales.", icon: "error", showCancelButton: false });
    return null;
  }

  if (!carrera.toLowerCase().includes("software")) {
    await Alert({ title: "Carrera no válida", html: "Solo se permiten registros para carreras de <b>Software</b>.", icon: "warning", showCancelButton: false });
    return null;
  }

  if (!itinerario || itinerario.toLowerCase() === "sin itinerario") {
    await Alert({ title: "Itinerario faltante", html: "No se puede registrar porque no tiene un itinerario asignado.", icon: "warning", showCancelButton: false });
    return null;
  }

  if (!ciudades.length) {
    await Alert({ title: "Ciudades no disponibles", html: "El catálogo de ciudades no está cargado. Intenta nuevamente en unos segundos.", icon: "warning", showCancelButton: false });
    return null;
  }

  const ciudadValida = ciudades.find(
    (c) =>
      c.Descripcion?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() ===
      ciudadNombre?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
  );

  if (!ciudadValida) {
    await Alert({ title: "Ciudad no encontrada", html: "No se pudo validar la ciudad en el sistema.", icon: "error", showCancelButton: false });
    return null;
  }

  return ciudadValida.id_ciudad;
}
