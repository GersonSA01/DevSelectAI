'use client';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useRouter, useSearchParams } from 'next/navigation';

export default function RegistrarPregunta() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idVacante = searchParams.get('idVacante');
  const idPregunta = searchParams.get('idPregunta');

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

  useEffect(() => {
    const fetchPreguntaYRespuestas = async () => {
      if (!idPregunta) return;

      try {
        const resPregunta = await fetch(`http://localhost:5000/api/preguntas/${idPregunta}`);
        const preguntaData = await resPregunta.json();
        console.log('Pregunta cargada:', preguntaData); // 👈 agrega esto

        setPregunta(preguntaData.Pregunta || preguntaData.pregunta || '');

        const resOpciones = await fetch(`http://localhost:5000/api/opciones/pregunta/${idPregunta}`);
        const opcionesData = await resOpciones.json();

        setOpciones(
          opcionesData.map(op => ({
            texto: op.Opcion,
            correcta: op.Correcta
          }))
        );
      } catch (error) {
        console.error('Error al cargar pregunta:', error);
      }
    };

    fetchPreguntaYRespuestas();
  }, [idPregunta]);

  const handleOpcionChange = (index) => {
    setOpciones(opciones.map((op, i) => ({ ...op, correcta: i === index })));
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
    if (!opciones.some(op => op.correcta)) {
      Swal.fire('Advertencia', 'Debes seleccionar una opción correcta.', 'warning');
      return;
    }

    try {
      let idPreguntaActual = idPregunta;

      if (!idPregunta) {
        const res = await fetch('http://localhost:5000/api/preguntas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Pregunta: pregunta,
            EsIA: false,
            Id_vacante: parseInt(idVacante)
          })
        });
        const nueva = await res.json();
        idPreguntaActual = nueva.Id_Pregunta;
      } else {
        await fetch(`http://localhost:5000/api/preguntas/${idPregunta}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ Pregunta: pregunta })
        });
        await fetch(`http://localhost:5000/api/opciones/pregunta/${idPregunta}`, { method: 'DELETE' });
      }

      await Promise.all(
        opciones
          .filter(op => op.texto.trim())
          .map(op =>
            fetch('http://localhost:5000/api/opciones', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                Opcion: op.texto,
                Correcta: op.correcta,
                Id_Pregunta: idPreguntaActual
              })
            })
          )
      );

      Swal.fire({
        icon: 'success',
        title: idPregunta ? '¡Pregunta actualizada!' : '¡Pregunta registrada!',
        confirmButtonColor: '#22c55e'
      }).then(() => {
        router.push(`/reclutador/preguntas?idVacante=${idVacante}`);
      });

    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo guardar la pregunta.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-white px-4 py-8">
      <div className="max-w-xl mx-auto">
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded mb-6 text-sm">
          Esta pregunta se generará en base a las <strong>habilidades requeridas</strong> de esta vacante. Solo se permite <strong>una opción correcta</strong>.
        </div>

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

       <form onSubmit={handleSubmit} className="bg-[#111827] p-6 rounded-lg shadow space-y-6">
  <div>
    <label className="block text-sm text-gray-300 mb-1">Texto de la pregunta:</label>
    <textarea
      className="w-full p-2 rounded-md text-sm bg-[#1f2937] text-white placeholder-gray-400 focus:ring-2 focus:outline-none"
      placeholder="Escribe la pregunta..."
      value={pregunta}
      onChange={(e) => setPregunta(e.target.value)}
      required
    />
  </div>

  <div>
    <h3 className="font-medium text-gray-300 mb-2">Opciones de respuesta</h3>
    {opciones.map((opcion, index) => (
      <div key={index} className="flex items-center gap-2 mb-2">
        <input
          type="radio"
          name="opcionCorrecta"
          checked={opcion.correcta}
          onChange={() => handleOpcionChange(index)}
        />
        <input
          type="text"
          className="flex-1 p-2 rounded-md text-sm bg-[#1f2937] text-white placeholder-gray-400 focus:ring-2 focus:outline-none"
          placeholder={`Opción ${index + 1}`}
          value={opcion.texto}
          onChange={(e) => handleTextoOpcion(index, e.target.value)}
          required
        />
        {opciones.length > 2 && (
          <button
            type="button"
            onClick={() => eliminarOpcion(index)}
            className="text-red-400 hover:text-red-600 text-xs"
          >✖</button>
        )}
      </div>
    ))}

    {opciones.length < 5 && (
      <button
        type="button"
        onClick={agregarOpcion}
        className="mt-2 bg-blue-600 hover:bg-blue-700 px-3 py-1 text-xs text-white rounded-md"
      >+ Agregar opción</button>
    )}
  </div>

  <button
    type="submit"
    className="w-full bg-green-500 hover:bg-green-600 px-4 py-2 rounded-md text-white font-medium"
  >
    Guardar pregunta
  </button>
</form>

      </div>
    </div>
  );
}
