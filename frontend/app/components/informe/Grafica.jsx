'use client';

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';
import { useState, useRef } from 'react';
import { Bar } from 'react-chartjs-2';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Grafica({
  tiempos,
  itinerario,
  habilidades,
  preguntasOrales,
  calificaciones
}) {
  const [seleccionado, setSeleccionado] = useState(null);
  const tarjetasRef = useRef([]);
  const tarjetasContainerRef = useRef(null);

  const formatearTiempo = (segundos) => {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return min > 0 ? `${min} min ${seg} seg` : `${seg} seg`;
  };

  const tiempoTotal =
    tiempos.entrevista.reduce((a, b) => a + b, 0) + tiempos.teorico + tiempos.tecnica;

  const handleSeleccionar = (index) => {
    const newSeleccionado = seleccionado === index ? null : index;
    setSeleccionado(newSeleccionado);

    const card = tarjetasRef.current[index];
    const container = tarjetasContainerRef.current;

    if (card && container && newSeleccionado !== null) {
      const offsetTop = card.offsetTop;
      const containerTop = container.scrollTop;
      const targetScroll = offsetTop - container.offsetTop;

      container.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  const data = {
    labels: ['Pregunta Oral 1', 'Pregunta Oral 2', 'Pregunta Oral 3', 'Opción Múltiple', 'Técnica'],
    datasets: [
      {
        label: 'Tiempo',
        data: [...tiempos.entrevista, tiempos.teorico, tiempos.tecnica],
        backgroundColor: (context) =>
          seleccionado === context.dataIndex ? '#00FFE0' : '#3BDCF6',
        borderColor: (context) =>
          seleccionado === context.dataIndex ? '#00FFE0' : '#3BDCF6',
        borderWidth: (context) =>
          seleccionado === context.dataIndex ? 2 : 1,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `Tiempo: ${formatearTiempo(context.raw)}`
        }
      }
    },
    onClick: (_, elements) => {
      if (elements.length > 0) {
        const idx = elements[0].index;
        handleSeleccionar(idx);
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#ccc' },
        grid: { color: '#444' }
      },
      x: {
        ticks: {
          color: '#ccc',
          maxRotation: 20,
          minRotation: 0,
          autoSkip: true,
          font: { size: 10 }
        },
        grid: { color: '#444' }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="bg-[#1D1E33] p-4 rounded-lg text-center">
          <p className="text-gray-400">Tiempo total</p>
          <p className="text-lg font-bold text-white">{formatearTiempo(tiempoTotal)}</p>
        </div>
        <div className="bg-[#1D1E33] p-4 rounded-lg text-center">
          <p className="text-gray-400">Itinerario</p>
          <p className="text-lg font-bold text-white">{itinerario}</p>
        </div>
        <div className="bg-[#1D1E33] p-4 rounded-lg text-center">
          <p className="text-gray-400">Habilidades Evaluadas</p>
          <p className="text-lg font-bold text-white">{habilidades.join(', ')}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div
          className="bg-[#1D1E33] p-6 rounded-lg w-full lg:w-2/3 flex flex-col"
          style={{ height: '500px' }}
        >
          <h2 className="text-xl font-semibold mb-4">Tiempo por pregunta</h2>
          <div className="flex-1">
            <Bar data={data} options={options} />
          </div>
        </div>

        <div
          ref={tarjetasContainerRef}
          className="
            bg-[#1D1E33]
            p-4
            rounded-lg
            w-full lg:w-1/3
            flex flex-col
            space-y-4
            overflow-y-auto
            custom-scroll
          "
          style={{ height: '500px' }}
        >
          <h3 className="text-white text-lg font-semibold">Preguntas Orales</h3>

          {[...preguntasOrales, { tipo: 'teorico' }, { tipo: 'tecnica' }].map((p, index) => {
            const isOral = index < 3;
            const isTeorico = p.tipo === 'teorico';
            const isTecnica = p.tipo === 'tecnica';

            let contenido;

            if (isOral) {
              contenido = (
                <>
                  <p className="font-bold text-white">Pregunta Oral {index + 1}</p>
                  <p className="text-sm text-gray-300"><span className="font-semibold">Pregunta:</span> {p.pregunta}</p>
                  <p className="text-sm text-gray-300"><span className="font-semibold">Respuesta:</span> {p.respuesta}</p>
                  <p className="text-sm text-gray-300"><span className="font-semibold">Tiempo:</span> {formatearTiempo(p.tiempoRespuesta || 0)}</p>
                  <p className="text-sm text-gray-300"><span className="font-semibold">Calificación:</span> {p.calificacion}</p>
                </>
              );
            }

            if (isTeorico) {
              contenido = (
                <>
                  <h4 className="font-bold text-white">Teóricas (total)</h4>
                  <p className="text-sm text-gray-300">Tiempo: {formatearTiempo(tiempos.teorico)}</p>
                  <p className="text-sm text-gray-300">Calificación: {calificaciones.teorico}</p>
                </>
              );
            }

            if (isTecnica) {
              contenido = (
                <>
                  <h4 className="font-bold text-white">Técnica (total)</h4>
                  <p className="text-sm text-gray-300">Tiempo: {formatearTiempo(tiempos.tecnica)}</p>
                  <p className="text-sm text-gray-300">Calificación: {calificaciones.tecnica}</p>
                </>
              );
            }

            return (
              <div
                key={index}
                ref={(el) => (tarjetasRef.current[index] = el)}
                onClick={() => handleSeleccionar(index)}
                className={`
                  bg-[#1D1E33]
                  p-4
                  rounded-lg
                  border
                  transition
                  duration-150
                  space-y-1
                  cursor-pointer
                  ${seleccionado === index
                    ? 'border-2 border-[#00FFE0] shadow-lg'
                    : 'border-transparent hover:border-[#3BDCF6]'}
                `}
              >
                {contenido}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #1D1E33;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background-color: #3BDCF6;
          border-radius: 4px;
          transition: background-color 0.3s ease;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #00FFE0;
        }
      `}</style>
    </div>
  );
}
