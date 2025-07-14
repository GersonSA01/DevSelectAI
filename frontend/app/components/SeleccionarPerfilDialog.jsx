"use client";
import { useRouter } from "next/navigation";

export default function SeleccionarPerfilDialog({ open, setOpen }) {
  if (!open) return null;
  const router = useRouter();

  const handleClose = () => {
    setOpen(false);   
    router.push("/"); 
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-[#2D2D2D] text-white rounded-2xl p-10 w-full max-w-2xl relative shadow-2xl border border-gray-700">
        
        
        <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold"
            >
            ×
        </button>


        
        <h2 className="text-center text-3xl font-bold mb-2">Selecciona tu perfil</h2>
        <p className="text-center text-sm text-gray-400 mb-8">
          Elige tu tipo de usuario para continuar con el proceso de evaluación automatizada.
        </p>

        
        <div className="flex justify-center gap-10">
          
          <div className="flex flex-col items-center bg-[#1A1A1A] rounded-2xl p-6 w-44">
            <img src="/estudiante.png" alt="Estudiante" className="w-20 h-20 rounded-full object-cover mb-3" />
            <p className="text-lg font-semibold mb-1">Estudiante</p>
            <p className="text-xs text-gray-400 mb-4 text-center">Accede como postulante.</p>
            <button
              onClick={() => window.location.href = "/auth/login_estudiante"}
              className="bg-primaryButton hover:bg-primaryButtonHover text-white py-1.5 px-4 rounded-full text-sm transition"
            >
              Ingresar
            </button>
          </div>

          
          <div className="flex flex-col items-center bg-[#1A1A1A] rounded-2xl p-6 w-44">
            <img src="/docente.png" alt="Docente" className="w-20 h-20 rounded-full object-cover mb-3" />
            <p className="text-lg font-semibold mb-1">Docente</p>
            <p className="text-xs text-gray-400 mb-4 text-center">Accede como evaluador.</p>
            <button
              onClick={() => window.location.href = "/auth/login_docente"}
              className="bg-primaryButton hover:bg-primaryButtonHover text-white py-1.5 px-4 rounded-full text-sm transition"
            >
              Ingresar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
