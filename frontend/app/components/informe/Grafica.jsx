'use client';

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';
import { useState } from 'react';
import { Bar } from 'react-chartjs-2';

// Registrar los módulos
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Grafica({ tiempos, itinerario, habilidades }) {
  const [seleccionado, setSeleccionado] = useState(null);

  const formatearTiempo = (segundos) => {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return min > 0 ? `${min} min ${seg} seg` : `${seg} seg`;
  };

  const data = {
    labels: ['Pregunta Oral 1', 'Pregunta Oral 2', 'Pregunta Oral 3', 'Opción Múltiple', 'Técnica'],
    datasets: [
      {
        label: 'Tiempo',
        data: [...tiempos.entrevista, tiempos.teorico, tiempos.tecnica],
        backgroundColor: (context) =>
          seleccionado === context.dataIndex ? '#00FFF0' : '#3BDCF6'
      }
    ]
  };

  const detallesPreguntas = data.labels.map((label, i) => ({
    label,
    tiempo: data.datasets[0].data[i],
    color: data.datasets[0].data[i] > 0 ? 'text-green-400' : 'text-red-400'
  }));

  const options = {
    responsive: true,
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

  const tiempoTotal = tiempos.entrevista.reduce((a, b) => a + b, 0) + tiempos.teorico + tiempos.tecnica;

  return (
    <div className="space-y-6">
      {/* Panel de resumen general */}
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

      {/* Gráfico y detalles en layout responsive */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Gráfico */}
        <div className="bg-[#1D1E33] p-6 rounded-lg w-full lg:w-2/3">
          <h2 className="text-xl font-semibold mb-4">Tiempo por pregunta</h2>
          <Bar data={data} options={options} />
        </div>

        {/* Detalles por pregunta */}
        <div className="w-full lg:w-1/3 space-y-4">
          {detallesPreguntas.map((p, index) => (
            <div
              key={index}
              className={`bg-[#1D1E33] p-4 rounded-lg border ${
                seleccionado === index ? 'border-[#3BDCF6]' : 'border-transparent'
              }`}
            >
              <p className="font-bold">{p.label}</p>
              <p className="text-sm text-gray-300">Tiempo: {formatearTiempo(p.tiempo)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
