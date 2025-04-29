"use client";

import Image from "next/image";
import { useState } from "react";
import SeleccionarPerfilDialog from "./components/SeleccionarPerfilDialog";
import RegistroDialog from "./components/RegistroDialog";

export default function Home() {
  const [open, setOpen] = useState(false);
  const [openRegistro, setOpenRegistro] = useState(false);


  return (
    <main className="relative min-h-screen flex items-center justify-center px-6 bg-background text-white overflow-hidden">
      
      {/* Imagen de fondo */}
      <Image
        src="/fondo_pantalla.png"
        alt="Fondo tecnológico DevSelectAI"
        layout="fill"
        objectFit="cover"
        quality={100}
        className="z-0"
      />

      {/* Capa negra semi-transparente */}
      <div className="absolute inset-0 bg-black opacity-50 z-10"></div>

      {/* Contenido */}
      <div className="relative z-20 text-center max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
          Transforma tus prácticas con IA
        </h1>
        <p className="text-lg mb-8">
          DevSelectAI automatiza el proceso de evaluación y asignación de prácticas preprofesionales para estudiantes de UNEMI mediante inteligencia artificial.
        </p>
        <div className="flex justify-center gap-4">
          <button 
            className="border border-primaryButton bg-primaryButton hover:bg-primaryButtonHover transform hover:scale-105 hover:shadow-lg text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
            onClick={() => setOpen(true)} // <- AQUÍ
          >
            Iniciar Sesión
          </button>
          <button className="border border-primaryButton text-white hover:bg-primaryButton hover:text-white transform hover:scale-105 hover:shadow-lg font-semibold py-3 px-6 rounded-lg transition duration-300" 
             onClick={() => setOpenRegistro(true)}>
            Registrarse
          </button>
        </div>
      </div>

      {/* Modal aquí */}
      <SeleccionarPerfilDialog open={open} setOpen={setOpen} />
      <RegistroDialog open={openRegistro} setOpen={setOpenRegistro} />
    </main>
  );
}
