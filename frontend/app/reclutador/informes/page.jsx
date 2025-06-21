'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function InformeEvaluacionTiempo() {
  const [datos, setDatos] = useState(null);
  const [seleccionado, setSeleccionado] = useState(null);
  const searchParams = useSearchParams();
  const idPostulante = searchParams.get('id');
  const informeRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/informe/${idPostulante}`);
        const json = await res.json();
        setDatos(json);
      } catch (error) {
        console.error('Error al obtener informe:', error);
      }
    };
    if (idPostulante) fetchData();
  }, [idPostulante]);

  const generarPDF = async () => {
    const canvas = await html2canvas(informeRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = pdfHeight;
    let position = 0;

    while (heightLeft > 0) {
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
      if (heightLeft > 0) {
        pdf.addPage();
        position = 0;
      }
    }

    pdf.save(`informe_postulante_${idPostulante}.pdf`);
  };

  if (!datos) return <p className="text-white p-10">Cargando informe...</p>;

const {
  nombre = '',
  itinerario = '',
  habilidades = [],
  tiempos = { entrevista: [], teorico: 0, tecnica: 0 },
  calificaciones = { entrevista: 0, teorico: 0, tecnica: 0, capturas: 0 },
  capturas = [],
  observacion = ''
} = datos;
const totalCapturas = Array.isArray(capturas) ? capturas.length : 0;
  const puntajeEvaluacion = calificaciones.entrevista + calificaciones.teorico + calificaciones.tecnica;
  const puntajeFinal = puntajeEvaluacion + calificaciones.capturas;

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

  const detallesPreguntas = data.labels.map((label, i) => ({
    label,
    tiempo: data.datasets[0].data[i],
    estado: data.datasets[0].data[i] > 0 ? 'Completada' : 'En blanco',
    color: data.datasets[0].data[i] > 0 ? 'text-green-400' : 'text-red-400'
  }));

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

  return (
    <div className="min-h-screen bg-[#0A0A23] text-white p-8 space-y-10">
      <div className="flex justify-end">
        <button
          onClick={generarPDF}
          className="mb-4 px-4 py-2 bg-[#3BDCF6] text-black rounded hover:bg-[#00FFF0]"
        >
          Descargar PDF
        </button>
      </div>

      <div ref={informeRef} className="space-y-10">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-center">Informe</h1>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-sm text-white">
            <div>
              <p className="font-semibold">Nombre: <span className="text-[#3BDCF6]">{nombre}</span></p>
              <p className="text-gray-400">Habilidades: {habilidades.join(', ')}</p>
            </div>
            <div className="text-right mt-4 md:mt-0">
              <p className="text-sm text-gray-400">Puntaje:</p>
              <p className="text-2xl font-bold text-[#3BDCF6]">{puntajeEvaluacion} / 10</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-[#1D1E33] p-4 rounded-lg text-center">
              <p className="text-gray-400">Tiempo total</p>
              <p className="text-lg font-bold text-white">
                {tiempos.entrevista.reduce((a, b) => a + b, 0) + tiempos.teorico + tiempos.tecnica} min
              </p>
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
            <span className="text-sm text-[#3BDCF6]">Calificación: {calificaciones.capturas} / {totalCapturas}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
            {capturas.map((c, i) => (
              <div key={i} className="bg-[#2B2C3F] h-32 rounded flex items-center justify-center overflow-hidden">
                {c.File ? (
                  <img src={c.File} alt={`captura ${i + 1}`} className="object-cover h-full w-full" />
                ) : (
                  <span>Sin imagen</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1D1E33] p-6 rounded-lg">
          <p className="text-xl font-semibold text-center">
            Puntaje Final: <span className="text-[#3BDCF6]">{puntajeFinal} / 14</span>
          </p>
        </div>

        <div className="bg-[#1D1E33] p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Observaciones del Reclutador</h2>
          <p className="text-sm text-gray-300">{observacion}</p>
        </div>
      </div>
    </div>
  );
}
