"use client";

export default function Home() {
  const onStart = () => {
    alert("Próximamente: iniciar evaluación");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center text-white px-6">
      <div className="text-center max-w-xl">
        <h1 className="text-5xl font-extrabold mb-6">DevSelectAI-PRUEBA</h1>
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
