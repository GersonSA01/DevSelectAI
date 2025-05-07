'use client';
import { useRouter } from 'next/navigation';

export default function PreguntasVacante() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0b1120] text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Preguntas del Vacante</h1>
      <p className="text-lg mb-6">Coordinador de proyecto (ejemplo)</p>

      <div className="flex justify-between items-center mb-4">
        <p>6 preguntas &nbsp;&nbsp;&nbsp; (10 puntos) &nbsp;&nbsp;&nbsp; IA 0/3</p>
        <button
          onClick={() => router.push('/reclutador/preguntas/registrar')}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          + Añadir pregunta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="border border-gray-600 p-4 rounded">
              <p className="mb-2 font-semibold">{n}. ¿Pregunta de ejemplo?</p>
              <p className="text-sm text-gray-300 mb-2">Ingresar {n === 3 ? 'código' : 'Texto'}</p>
              <div className="flex gap-4 text-sm">
                <button className="text-yellow-400">✏️ Editar</button>
                <button className="text-red-500">🗑 Eliminar</button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#1e293b] p-4 rounded border border-gray-700 h-fit">
          <p className="font-semibold mb-2">Seleccione el nivel de dificultad</p>
          <button className="w-full py-2 bg-gray-700 text-white mb-2">Alto</button>
          <button className="w-full py-2 bg-white text-black mb-2">Medio</button>
          <button className="w-full py-2 bg-white text-black">Bajo</button>
        </div>
      </div>
    </div>
  );
}
