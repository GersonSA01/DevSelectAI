'use client';

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useState } from 'react';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function InformeEvaluacionTiempo() {
  const tiempos = {
    entrevista: [5, 4, 6],
    teorico: 8,
    tecnica: 12
  };

  const totalCapturas = 4;
  const calificacionCapturas = 2;
  const calificaciones = {
    entrevista: 3,
    teorico: 4,
    tecnica: 2,
    capturas: calificacionCapturas
  };

  const puntajeEvaluacion = calificaciones.entrevista + calificaciones.teorico + calificaciones.tecnica; // /10
  const puntajeFinal = puntajeEvaluacion + calificaciones.capturas; // /14

  const [seleccionado, setSeleccionado] = useState(null);

  const data = {
    labels: ['Pregunta Oral 1', 'Pregunta Oral 2', 'Pregunta Oral 3', 'Opción Múltiple', 'Técnica'],
    datasets: [
      {
        label: 'Minutos',
        data: [...tiempos.entrevista, tiempos.teorico, tiempos.tecnica],
        backgroundColor: (context) => {
          const index = context.dataIndex;
          return seleccionado === index ? '#00FFF0' : '#3BDCF6';
        }
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `Tiempo: ${context.raw} min`
        }
      }
    },
    onClick: (_, elements) => {
      if (elements.length > 0) {
        setSeleccionado(elements[0].index);
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#ccc' },
        grid: { color: '#444' }
      },
      x: {
        ticks: { color: '#ccc' },
        grid: { color: '#444' }
      }
    }
  };

  const detallesPreguntas = [
    { label: 'Pregunta Oral 1', tiempo: 5, estado: 'Completada', color: 'text-green-400' },
    { label: 'Pregunta Oral 2', tiempo: 4, estado: 'Completada', color: 'text-green-400' },
    { label: 'Pregunta Oral 3', tiempo: 6, estado: 'Completada', color: 'text-green-400' },
    { label: 'Opción Múltiple', tiempo: 8, estado: 'Parcial', color: 'text-yellow-400' },
    { label: 'Técnica', tiempo: 12, estado: 'En blanco', color: 'text-red-400' }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A23] text-white p-8 space-y-10">
      {/* Encabezado tipo dashboard limpio */}
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-center">Informe</h1>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-sm text-white">
          <div>
            <p className="font-semibold">Nombre: <span className="text-[#3BDCF6]">Chimi</span></p>
            <p className="text-gray-400">Habilidades: React, SQL, Express</p>
          </div>
          <div className="text-right mt-4 md:mt-0">
            <p className="text-sm text-gray-400">Puntaje:</p>
            <p className="text-2xl font-bold text-[#3BDCF6]">{puntajeEvaluacion} / 10</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-[#1D1E33] p-4 rounded-lg text-center">
            <p className="text-gray-400">Tiempo total</p>
            <p className="text-lg font-bold text-white">16 min</p>
          </div>
          <div className="bg-[#1D1E33] p-4 rounded-lg text-center">
            <p className="text-gray-400">Itinerario</p>
            <p className="text-lg font-bold text-white">Desarrollo de Software</p>
          </div>
          <div className="bg-[#1D1E33] p-4 rounded-lg text-center">
  <p className="text-gray-400">Habilidades Evaluadas</p>
  <p className="text-lg font-bold text-white">
    React, SQL, Express
  </p>
</div>

        </div>
      </div>


      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-[#1D1E33] p-6 rounded-lg md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Tiempo por pregunta (minutos)</h2>
          <Bar data={data} options={options} />
        </div>
        <div className="space-y-4">
          {detallesPreguntas.map((p, index) => (
            <div
              key={index}
              className={`bg-[#1D1E33] p-4 rounded-lg border ${seleccionado === index ? 'border-[#3BDCF6]' : 'border-transparent'}`}
            >
              <p className="font-bold">{p.label}</p>
              <p className="text-sm text-gray-300">Tiempo: {p.tiempo} min</p>
              <p className={`text-sm ${p.color}`}>Estado: {p.estado}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#1D1E33] p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Capturas</h2>
          <span className="text-sm text-[#3BDCF6]">Calificación: {calificacionCapturas} / {totalCapturas}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
          <div className="bg-[#2B2C3F] h-32 rounded flex items-center justify-center">Imagen 1</div>
          <div className="bg-[#2B2C3F] h-32 rounded flex items-center justify-center">Imagen 2</div>
          <div className="bg-[#2B2C3F] h-32 rounded flex items-center justify-center">Imagen 3</div>
          <div className="bg-[#2B2C3F] h-32 rounded flex items-center justify-center">Imagen 4</div>
        </div>
      </div>

      <div className="bg-[#1D1E33] p-6 rounded-lg">
        <p className="text-xl font-semibold text-center">
          Puntaje Final: <span className="text-[#3BDCF6]">{puntajeFinal} / 14</span>
        </p>
      </div>

      <div className="bg-[#1D1E33] p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Observaciones del Reclutador</h2>
        <p className="text-sm text-gray-300">
          El postulante completó cada sección de forma ordenada. Durante la entrevista oral mantuvo coherencia y dominio en sus respuestas.
          Se detectó una breve distracción visual en una de las preguntas, registrada por las capturas.
        </p>
      </div>
    </div>
  );
}
