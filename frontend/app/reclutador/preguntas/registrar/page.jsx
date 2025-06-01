'use client';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useRouter, useSearchParams } from 'next/navigation';

export default function RegistrarPregunta() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idVacante = searchParams.get('idVacante');

  const [pregunta, setPregunta] = useState('');
  const [habilidades, setHabilidades] = useState([]);
  const [opciones, setOpciones] = useState([
    { texto: '', correcta: false },
    { texto: '', correcta: false }
  ]);

  useEffect(() => {
    const fetchHabilidades = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/vacantes/${idVacante}/habilidades`);
        const data = await res.json();
        setHabilidades(data);
      } catch (error) {
        console.error('Error al obtener habilidades:', error);
      }
    };

    fetchHabilidades();
  }, [idVacante]);

  const handleOpcionChange = (index) => {
    const nuevas = opciones.map((op, i) => ({
      ...op,
      correcta: i === index
    }));
    setOpciones(nuevas);
  };

  const handleTextoOpcion = (index, value) => {
    const nuevas = [...opciones];
    nuevas[index].texto = value;
    setOpciones(nuevas);
  };

  const agregarOpcion = () => {
    if (opciones.length < 5) {
      setOpciones([...opciones, { texto: '', correcta: false }]);
    }
  };

  const eliminarOpcion = (index) => {
    if (opciones.length > 2) {
      setOpciones(opciones.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hayCorrecta = opciones.some((op) => op.correcta);
    if (!hayCorrecta) {
      Swal.fire('Advertencia', 'Debes seleccionar una opción correcta.', 'warning');
      return;
    }

    try {
      const resPregunta = await fetch('http://localhost:5000/api/preguntas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Pregunta: pregunta,
          EsIA: false,
          Id_vacante: parseInt(idVacante),
        }),
      });

      const nuevaPregunta = await resPregunta.json();

      await Promise.all(
        opciones.map(op =>
          fetch('http://localhost:5000/api/opciones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              Opcion: op.texto,
              Correcta: op.correcta,
              Id_Pregunta: nuevaPregunta.Id_Pregunta
            })
          })
        )
      );

      Swal.fire({
        icon: 'success',
        title: '¡Pregunta registrada!',
        text: 'La pregunta y sus opciones han sido guardadas.',
        confirmButtonColor: '#22c55e'
      }).then(() => {
        router.push(`/reclutador/preguntas?idVacante=${idVacante}`);
      });
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo registrar la pregunta.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-white px-4 py-8">
      <div className="max-w-xl mx-auto">
        {/* Nota de contexto */}
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded mb-6 text-sm">
          Esta pregunta se generará en base a las <strong>habilidades requeridas</strong> de esta vacante.
          Solo se permite <strong>una opción correcta</strong>.
        </div>

        {/* Habilidades */}
        {habilidades.length > 0 && (
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-2">Habilidades requeridas:</h3>
            <div className="flex flex-wrap gap-2">
              {habilidades.map((h) => (
                <span key={h.Id_Habilidad} className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                  {h.Descripcion}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-[#111827] p-6 rounded shadow space-y-6">
          <div>
            <label className="block text-sm mb-1">Texto de la pregunta:</label>
            <textarea
              className="w-full p-2 rounded text-black"
              placeholder="Escribe la pregunta..."
              value={pregunta}
              onChange={(e) => setPregunta(e.target.value)}
              required
            />
          </div>

          <div>
            <h3 className="font-semibold mb-2">Opciones de respuesta</h3>
            {opciones.map((opcion, index) => (
              <div key={index} className="flex items-center mb-2 gap-2">
                <input
                  type="radio"
                  name="opcionCorrecta"
                  checked={opcion.correcta}
                  onChange={() => handleOpcionChange(index)}
                  className="accent-green-500"
                />
                <input
                  type="text"
                  className="flex-1 p-2 rounded text-black"
                  placeholder={`Opción ${index + 1}`}
                  value={opcion.texto}
                  onChange={(e) => handleTextoOpcion(index, e.target.value)}
                  required
                />
                {opcion.correcta && (
                  <span className="text-green-400 text-sm font-semibold">✔ Correcta</span>
                )}
                {opciones.length > 2 && (
                  <button
                    type="button"
                    onClick={() => eliminarOpcion(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ✖
                  </button>
                )}
              </div>
            ))}

            {opciones.length < 5 && (
              <button
                type="button"
                onClick={agregarOpcion}
                className="mt-2 bg-blue-600 hover:bg-blue-700 px-3 py-1 text-sm text-white rounded"
              >
                + Agregar opción
              </button>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-white"
          >
            Guardar pregunta
          </button>
        </form>
      </div>
    </div>
  );
}
