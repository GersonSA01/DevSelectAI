"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { validarCamposRegistro } from "./validacionesRegistro";
import { Alert } from "./alerts/Alerts";

export default function RegistroDialog({ open, setOpen, setOpenPerfil }) {
  const router = useRouter();

  const [cedula, setCedula] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [rol, setRol] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [carrera, setCarrera] = useState("");
  const [itinerario, setItinerario] = useState("");
  const [ciudadNombre, setCiudadNombre] = useState("");
  const [ciudades, setCiudades] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/ciudades")
      .then((res) => res.json())
      .then((data) => setCiudades(data));
  }, []);

  const normalizar = (texto) =>
    texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  const handleBuscar = async () => {
    if (!cedula) return;

    try {
      const res = await fetch(`http://localhost:5000/api/excel/${cedula}`);
      if (!res.ok) {
        await Alert({
          title: "Postulante no encontrado",
          html: "Verifica la cédula ingresada.",
          icon: "error",
        });
        return;
      }

      const data = await res.json();

      if (!data.Carrera || !data.Carrera.toLowerCase().includes("software")) {
        await Alert({
          title: "Carrera no válida",
          html: "Solo se permiten registros para carreras de <b>Software</b>.",
          icon: "warning",
        });
        return;
      }

      setNombres(data.Nombre);
      setApellidos(data.Apellido);
      setCorreo(data.Correo);
      setRol(data.Rol);
      setCarrera(data.Carrera);
      setItinerario(data.Itinerario || "Sin Itinerario");
      setCiudadNombre(data.Ciudad || "");
      setTelefono("");
    } catch (error) {
      console.error("Error buscando postulante:", error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    router.push("/");
  };

  const handleIrALogin = () => {
    setOpen(false);
    setOpenPerfil(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación de existencia previa por cédula (solo para estudiantes)
    if (rol.toLowerCase() === "estudiante") {
      try {
        const check = await fetch(`http://localhost:5000/api/postulante/cedula/${cedula}`);

        if (check.ok) {
          const existente = await check.json();
          if (existente) {
            await Alert({
              title: "Ya estás registrado",
              html: "Ya existe una cuenta asociada a esta cédula.",
              icon: "info",
            });
            return;
          }
        }
      } catch (err) {
        console.error("Error al verificar existencia:", err);
      }
    }

    const idCiudad = await validarCamposRegistro({
      contrasena,
      confirmarContrasena,
      carrera,
      itinerario,
      ciudades,
      ciudadNombre,
    });

    if (!idCiudad) return;

    let body = {};
    let endpoint = "";

    if (rol.toLowerCase() === "estudiante") {
      endpoint = "http://localhost:5000/api/postulante";
      body = {
        Cedula: cedula,
        Nombre: nombres,
        Apellido: apellidos,
        Correo: correo,
        Telefono: telefono,
        Contrasena: contrasena,
        ayuda: false,
        cant_alert: 0,
        FechPostulacion: new Date(),
        id_ciudad: idCiudad,
        id_EstadoPostulacion: 1,
        Itinerario: itinerario,
      };
    } else if (rol.toLowerCase() === "docente") {
      endpoint = "http://localhost:5000/api/reclutador";
      body = {
        Cedula: cedula,
        Nombres: nombres,
        Apellidos: apellidos,
        Correo: correo,
        Telefono: telefono,
        Contrasena: contrasena,
      };
    } else {
      await Alert({
        title: "Rol no válido",
        html: "El rol debe ser <b>Estudiante</b> o <b>Docente</b>.",
        icon: "error",
      });
      return;
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        await Alert({
          title: "Error al registrar",
          html: "Verifica los datos ingresados.",
          icon: "error",
        });
        return;
      }

      await Alert({
        title: "Registro exitoso",
        html: "Tu cuenta ha sido creada. Puedes iniciar sesión.",
        icon: "success",
      });

      handleIrALogin();
    } catch (error) {
      console.error("Error en registro:", error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-[#0B0F24] text-white rounded-2xl p-8 w-full max-w-md relative shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold"
        >
          ×
        </button>

        <h2 className="text-center text-2xl font-bold mb-2">
          Crea tu cuenta en DevSelectAI
        </h2>
        <p className="text-center text-sm text-blue-500 mb-6">
          Accede al sistema de prácticas preprofesionales con IA
        </p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Cédula"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              className="flex-1 p-2 rounded-md bg-gray-800 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleBuscar}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-md"
            >
              Buscar
            </button>
          </div>

          <input
            type="text"
            placeholder="Nombres"
            value={nombres}
            readOnly
            className="p-2 rounded-md bg-gray-800 text-white border border-gray-600 opacity-70 cursor-not-allowed"
          />
          <input
            type="text"
            placeholder="Apellidos"
            value={apellidos}
            readOnly
            className="p-2 rounded-md bg-gray-800 text-white border border-gray-600 opacity-70 cursor-not-allowed"
          />
          <input
            type="email"
            placeholder="Correo institucional"
            value={correo}
            readOnly
            className="p-2 rounded-md bg-gray-800 text-white border border-gray-600 opacity-70 cursor-not-allowed"
          />
          <input
            type="text"
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="p-2 rounded-md bg-gray-800 text-white placeholder-gray-400 border border-gray-600"
          />
          <input
            type="text"
            placeholder="Rol"
            value={rol}
            readOnly
            className="p-2 rounded-md bg-gray-800 text-white border border-gray-600 opacity-70 cursor-not-allowed"
          />
          <input
            type="text"
            placeholder="Ciudad"
            value={ciudadNombre}
            readOnly
            className="p-2 rounded-md bg-gray-800 text-white border border-gray-600 opacity-70 cursor-not-allowed"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            className="p-2 rounded-md bg-gray-800 text-white placeholder-gray-400 border border-gray-600"
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmarContrasena}
            onChange={(e) => setConfirmarContrasena(e.target.value)}
            className="p-2 rounded-md bg-gray-800 text-white placeholder-gray-400 border border-gray-600"
          />

          <button
            type="submit"
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold"
          >
            Registrarme
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-4">
          ¿Ya tienes una cuenta?{" "}
          <button
            onClick={handleIrALogin}
            className="text-blue-400 hover:underline"
          >
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  );
}
