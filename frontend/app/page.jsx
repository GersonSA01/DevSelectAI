"use client";

import Swal from "sweetalert2";

export default function Home() {
  const onStart = () => {
    Swal.fire({
      title: "Iniciar Evaluación",
      text: "¿Estás listo para comenzar tu evaluación técnica?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "¡Sí, comenzar!",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "rounded-xl",
        confirmButton: "bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition",
        cancelButton: "bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("¡Comenzando!", "La evaluación técnica está por iniciar.", "success");
      }
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center text-white px-6">
      <div className="text-center max-w-xl">
        <h1 className="text-5xl font-extrabold mb-6">DevSelectAI</h1>
        <h2 className="text-3xl font-bold mb-4">Revoluciona tu camino profesional</h2>
        <p className="text-lg text-gray-300 mb-8">
          Postúlate a prácticas preprofesionales en UNEMI mediante evaluaciones técnicas automatizadas.
        </p>
        <button
          onClick={onStart}
          className="bg-blue-600 px-8 py-4 rounded-xl text-white font-semibold hover:bg-blue-700 transition duration-300"
        >
          Iniciar Evaluación
        </button>
      </div>
    </main>
  );
}
