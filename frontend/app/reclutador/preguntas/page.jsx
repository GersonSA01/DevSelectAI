'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function PreguntasVacante() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idVacante = searchParams.get('idVacante') || 1;
  
  const [preguntas, setPreguntas] = useState([]);
  const [vacante, setVacante] = useState(null);
  const [habilidades, setHabilidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nivelDificultad, setNivelDificultad] = useState('Medio');

  // Función para obtener información de la vacante
  const fetchVacante = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/vacantes/${idVacante}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar la información de la vacante');
      }
      
      const data = await response.json();
      setVacante(data);
    } catch (err) {
      console.error('Error fetching vacante:', err);
    }
  };

  // Función para obtener las habilidades de la vacante
  const fetchHabilidades = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/vacantes/${idVacante}/habilidades`);
      
      if (!response.ok) {
        throw new Error('Error al cargar las habilidades');
      }
      
      const data = await response.json();
      setHabilidades(data);
    } catch (err) {
      console.error('Error fetching habilidades:', err);
    }
  };

  // Función para obtener preguntas de la API
  const fetchPreguntas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/preguntas/vacante/${idVacante}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar las preguntas');
      }
      
      const data = await response.json();
      setPreguntas(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching preguntas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar pregunta
  const handleEliminarPregunta = async (idPregunta) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta pregunta?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/preguntas/${idPregunta}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la pregunta');
      }

      // Recargar las preguntas después de eliminar
      await fetchPreguntas();
    } catch (err) {
      alert('Error al eliminar la pregunta: ' + err.message);
    }
  };

  // Función para obtener el tipo de pregunta
  const getTipoPregunta = (idTipo) => {
    const tipos = {
      1: 'Texto',
      2: 'Código',
      3: 'Opción múltiple'
    };
    return tipos[idTipo] || 'Texto';
  };

  // Cargar todos los datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchVacante(),
        fetchHabilidades(),
        fetchPreguntas()
      ]);
    };
    
    loadData();
  }, [idVacante]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="h-6 bg-gray-300 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
          <button 
            onClick={() => {
              fetchVacante();
              fetchHabilidades();
              fetchPreguntas();
            }}
            className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Información de la vacante */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Preguntas del Vacante {idVacante}
          </h1>
          
          {vacante && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                {vacante.Descripcion}
              </h2>
              
              {vacante.Contexto && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 className="font-medium text-gray-700 mb-2">Contexto:</h3>
                  <p className="text-gray-600 text-sm">{vacante.Contexto}</p>
                </div>
              )}
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Cantidad: {vacante.Cantidad}</span>
                {vacante.CantidadUsoIA && (
                  <span>Uso IA: {vacante.CantidadUsoIA}</span>
                )}
              </div>
            </div>
          )}

          {/* Habilidades requeridas */}
          {habilidades.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Habilidades requeridas:</h3>
              <div className="flex flex-wrap gap-2">
                {habilidades.map((habilidad) => (
                  <span
                    key={habilidad.Id_Habilidad}
                    className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                  >
                    {habilidad.Descripcion}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              {preguntas.length} preguntas
            </span>
            <span className="text-sm text-gray-500">
              ({preguntas.length * 10} puntos)
            </span>
            <span className="text-sm text-orange-600">
              IA {Math.floor(preguntas.length / 2)}/{Math.ceil(preguntas.length / 2)}
            </span>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => router.push(`/reclutador/preguntas/registrar?idVacante=${idVacante}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
            >
              + Añadir pregunta
            </button>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {preguntas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay preguntas registradas para esta vacante.</p>
              <button
                onClick={() => router.push(`/reclutador/preguntas/registrar?idVacante=${idVacante}`)}
                className="mt-2 text-green-600 hover:text-green-700 underline"
              >
                Crear la primera pregunta
              </button>
            </div>
          ) : (
            preguntas.map((pregunta, index) => (
              <div key={pregunta.Id_Pregunta} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-800">
                    {index + 1}. {pregunta.Pregunta}
                  </h3>
                </div>
                
                <div className="text-sm text-gray-600 mb-3">
                  Tipo: {getTipoPregunta(pregunta.Id_TipoPregunta)}
                </div>
                
                {pregunta.RptaPregunta && (
                  <div className="text-sm text-gray-700 mb-3 p-2 bg-gray-50 rounded">
                    <strong>Respuesta esperada:</strong> {pregunta.RptaPregunta}
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => router.push(`/preguntas/editar/${pregunta.Id_Pregunta}?idVacante=${idVacante}`)}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleEliminarPregunta(pregunta.Id_Pregunta)}
                    className="text-red-600 hover:text-red-800 text-sm flex items-center"
                  >
                    🗑 Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}