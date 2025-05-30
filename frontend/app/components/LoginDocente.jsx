"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import RegistroDialog from "../components/RegistroDialog";
import SeleccionarPerfilDialog from "../components/SeleccionarPerfilDialog";

export default function LoginDocente() {
  const router = useRouter();
  const [openRegistro, setOpenRegistro] = useState(false);
  const [openPerfil, setOpenPerfil] = useState(false);
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/login-reclutador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena }),
      });

      if (!res.ok) {
        alert("Correo o contraseña incorrectos");
        return;
      }

      const data = await res.json();
      console.log("Inicio de sesión exitoso:", data);

      // ✅ Guardar el reclutador en localStorage con nombres en minúscula
      // separar el nombre completo si es necesario
      const [nombres, ...resto] = (data.nombres || "").split(" ");
      const apellidos = resto.join(" ") || "";

      localStorage.setItem("reclutador", JSON.stringify({
        nombres,
        apellidos,
        correo: data.correo
      }));

      alert(`Bienvenido/a ${nombres} ${apellidos}`);

      router.push("/reclutador");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Ocurrió un error al intentar iniciar sesión");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-white">
      <div className="bg-[#0B0F24] p-8 rounded-2xl w-full max-w-md shadow-[0_0_30px_rgba(0,191,255,0.15)] border border-[#1E293B]">
        <h2 className="text-center text-2xl font-bold mb-2">
          Accede a DevSelectAI como Docente
        </h2>
        <p className="text-center text-sm text-[#38bdf8] mb-6">
          Sistema Inteligente para Prácticas Preprofesionales UNEMI
        </p>

        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="correo@unemi.edu.ec"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="p-3 rounded-md bg-[#1E293B] text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#38bdf8]"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            className="p-3 rounded-md bg-[#1E293B] text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#38bdf8]"
          />

          <button
            type="submit"
            className="mt-2 bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#0B0F24] py-2 rounded-md font-semibold transition-colors duration-200"
          >
            Iniciar sesión
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-4">
          ¿No tienes cuenta?{" "}
          <button
            type="button"
            onClick={() => setOpenRegistro(true)}
            className="text-[#38bdf8] hover:underline"
          >
            Regístrate aquí
          </button>
        </p>
      </div>

      {/* Modales */}
      <RegistroDialog
        open={openRegistro}
        setOpen={setOpenRegistro}
        setOpenPerfil={setOpenPerfil}
      />
      <SeleccionarPerfilDialog
        open={openPerfil}
        setOpen={setOpenPerfil}
      />
    </div>
  );
}
