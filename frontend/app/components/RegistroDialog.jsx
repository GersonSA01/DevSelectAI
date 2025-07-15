"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { validarCamposRegistro } from "./validacionesRegistro";
import { Alert } from "./alerts/Alerts";



const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

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
    const cargarCiudades = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/ciudades`);
        if (!res.ok) throw new Error("No se pudo cargar ciudades");
        const data = await res.json();
        setCiudades(data);
      } catch (err) {
        console.error("Error al cargar ciudades:", err);
        await Alert({
          title: "Error",
          html: "No se pudieron cargar las ciudades. Intenta más tarde.",
          icon: "error",
        });
      }
    };
    cargarCiudades();
  }, []);

  const handleBuscar = async () => {
    if (!cedula) return;

    if (!/^\d{10}$/.test(cedula)) {
      await Alert({
        title: "Cédula inválida",
        html: "Debe contener exactamente 10 dígitos.",
        icon: "error",
      });
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/excel/${cedula}`);
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

  const resetForm = () => {
    setCedula("");
    setNombres("");
    setApellidos("");
    setCorreo("");
    setTelefono("");
    setRol("");
    setContrasena("");
    setConfirmarContrasena("");
    setCarrera("");
    setItinerario("");
    setCiudadNombre("");
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

  if (!/^\d{10}$/.test(cedula)) {
    await Alert({ title: "Cédula inválida", html: "Debe contener exactamente 10 dígitos.", icon: "error" });
    return;
  }

  if (telefono && !/^\d{7,10}$/.test(telefono)) {
    await Alert({ title: "Teléfono inválido", html: "Entre 7 y 10 dígitos numéricos.", icon: "error" });
    return;
  }

  if (contrasena.length < 8) {
    await Alert({ title: "Contraseña débil", html: "Debe tener mínimo 8 caracteres.", icon: "error" });
    return;
  }

  if (contrasena !== confirmarContrasena) {
    await Alert({ title: "Contraseñas no coinciden", html: "Verifica las contraseñas.", icon: "error" });
    return;
  }

  if (rol.toLowerCase() !== "estudiante" && rol.toLowerCase() !== "docente") {
    await Alert({ title: "Rol no válido", html: "El rol debe ser <b>Estudiante</b> o <b>Coordinador de práctica</b>.", icon: "error" });
    return;
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
    endpoint = `${BACKEND_URL}/api/postulante`;
    body = {
      Cedula: cedula.trim(),
      Nombre: nombres.trim(),
      Apellido: apellidos.trim(),
      Correo: correo.trim(),
      Telefono: telefono.trim(),
      Contrasena: contrasena,
      ayuda: false,
      cant_alert: 0,
      FechPostulacion: new Date(),
      id_ciudad: idCiudad,
      id_EstadoPostulacion: 6,
      ItinerarioExcel: itinerario,
    };
  } else {
    endpoint = `${BACKEND_URL}/api/reclutador`;
    body = {
      Cedula: cedula.trim(),
      Nombres: nombres.trim(),
      Apellidos: apellidos.trim(),
      Correo: correo.trim(),
      Telefono: telefono.trim(),
      Contrasena: contrasena,
    };
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      await Alert({
        title: "Error al registrar",
        html: data.error || "Verifica los datos ingresados.",
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

              <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
        
        <div className="md:col-span-2 flex gap-2">
          <input
            type="text"
            placeholder="Cédula"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleBuscar();
              }
            }}
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
          className="md:col-span-2 mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold"
        >
          Registrarme
        </button>
      </form>


        <p className="text-center text-sm text-gray-400 mt-4">
          ¿Ya tienes una cuenta?{" "}
          <button onClick={handleIrALogin} className="text-blue-400 hover:underline">
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  );
}
