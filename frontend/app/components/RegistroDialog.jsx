import { useRouter } from "next/navigation";

export default function RegistroDialog({ open, setOpen, setOpenPerfil }) {
  if (!open) return null;
  const router = useRouter();

  const handleClose = () => {
    setOpen(false);   // Cierra el modal
    router.push("/"); // Redirige a la página principal
  };

  const handleIrALogin = () => {
    setOpen(false);        // Cierra el modal de registro
    setOpenPerfil(true);   // Abre el modal para seleccionar perfil
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-[#0B0F24] text-white rounded-2xl p-8 w-full max-w-md relative shadow-2xl">

        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold"
          >
          ×
        </button>


        {/* Formulario de registro */}
        <h2 className="text-center text-2xl font-bold mb-2">Crea tu cuenta en DevSelectAI</h2>
        <p className="text-center text-sm text-primaryButton mb-6">
          Accede al sistema de prácticas preprofesionales con IA
        </p>

        <form className="flex flex-col gap-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Cédula"
              className="flex-1 p-2 rounded-md bg-background text-white placeholder-gray-400 border border-input"
            />
            <button
              type="button"
              className="bg-primaryButton hover:bg-primaryButtonHover text-white px-4 rounded-md"
            >
              Buscar
            </button>
          </div>

          <input
            type="text"
            placeholder="Nombres Completos"
            className="p-2 rounded-md bg-background text-white placeholder-gray-400 border border-input"
          />
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Correo institucional"
              className="flex-1 p-2 rounded-md bg-background text-white placeholder-gray-400 border border-input"
            />
            <input
              type="text"
              placeholder="Teléfono"
              className="flex-1 p-2 rounded-md bg-background text-white placeholder-gray-400 border border-input"
            />
          </div>
          <input
            type="password"
            placeholder="Contraseña"
            className="p-2 rounded-md bg-background text-white placeholder-gray-400 border border-input"
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            className="p-2 rounded-md bg-background text-white placeholder-gray-400 border border-input"
          />

          <button
            type="submit"
            className="mt-2 bg-primaryButton hover:bg-primaryButtonHover text-white py-2 rounded-md font-semibold"
          >
            Registrarme
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-4">
          ¿Ya tienes una cuenta?{" "}
          <button onClick={handleIrALogin} className="text-primaryButton hover:underline">
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  );
}
