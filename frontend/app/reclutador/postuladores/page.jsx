'use client';
import { useState } from 'react';
import { FiEye, FiCheck, FiX } from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function PostulacionesPage() {
  const [filtroNombre, setFiltroNombre] = useState('');
  const [itinerario, setItinerario] = useState('1');

  const postulantes = [
    {
      nombre: 'Juanito',
      estado: 'Por evaluar',
      habilidades: 'React, Tailwind',
      calificacion: null,
    },
    {
      nombre: 'Juanita',
      estado: 'Evaluado',
      habilidades: 'Python, Java',
      calificacion: '8/10',
    },
    {
      nombre: 'Chimi',
      estado: 'Rechazado',
      habilidades: 'Comer, Dormir',
      calificacion: '4/10',
    },
    {
      nombre: '—',
      estado: 'Por hacer',
      habilidades: '—',
      calificacion: '—',
    },
  ];

  const mostrarModalAsignacion = () => {
    Swal.fire({
      title: 'Seleccionar Vacante para Asignar',
      html: `
        <table style="width: 100%; text-align: left; font-size: 14px;">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Vacante</th>
              <th>Cantidad</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Agrotech S.A.</td>
              <td>Analista de Sistemas</td>
              <td>3</td>
              <td><button onclick="asignarVacante(0)" class="swal2-styled">Asignar</button></td>
            </tr>
            <tr>
              <td>Turismo Global</td>
              <td>Desarrollador Web</td>
              <td>2</td>
              <td><button onclick="asignarVacante(1)" class="swal2-styled">Asignar</button></td>
            </tr>
            <tr>
              <td>Industria Nova</td>
              <td>Soporte Técnico</td>
              <td>5</td>
              <td><button onclick="asignarVacante(2)" class="swal2-styled">Asignar</button></td>
            </tr>
            <tr>
              <td>Data Solutions</td>
              <td>Analista de Datos</td>
              <td>1</td>
              <td><button onclick="asignarVacante(3)" class="swal2-styled">Asignar</button></td>
            </tr>
          </tbody>
        </table>
      `,
      showConfirmButton: true,
      confirmButtonText: 'Aceptar',
      width: '800px',
      didOpen: () => {
        const asignarVacante = (i) => {
          Swal.fire({
            icon: 'success',
            title: '¡Vacante asignada!',
            text: 'Se asignó correctamente la vacante.',
            confirmButtonColor: '#22c55e',
          });
        };
        window.asignarVacante = asignarVacante;
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Postulaciones</h1>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <label>Postulantes:</label>
          <div className="flex items-center bg-gray-100 rounded px-2 py-1 text-black">
            🔍
            <input
              type="text"
              placeholder="Buscar"
              className="bg-transparent outline-none ml-2"
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label>Itinerario:</label>
          <select
            className="text-black rounded px-2 py-1"
            value={itinerario}
            onChange={(e) => setItinerario(e.target.value)}
          >
            <option value="1">Itinerario 1</option>
            <option value="2">Itinerario 2</option>
            <option value="3">Itinerario 3</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-700 text-center">
          <thead className="bg-[#1e3a8a]">
            <tr>
              <th className="border border-gray-600 p-2">Nombre</th>
              <th className="border border-gray-600 p-2">Estado</th>
              <th className="border border-gray-600 p-2">Habilidades detectadas</th>
              <th className="border border-gray-600 p-2">Calificación</th>
              <th className="border border-gray-600 p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {postulantes.map((p, i) => (
              <tr key={i} className="border-t border-gray-700">
                <td className="p-2">{p.nombre}</td>
                <td className="p-2">{p.estado}</td>
                <td className="p-2">{p.habilidades}</td>
                <td className="p-2">
                  {p.calificacion ? (
                    p.calificacion
                  ) : (
                    <button className="bg-green-100 text-black px-2 py-1 rounded text-sm">
                      Comprobar calificación
                    </button>
                  )}
                </td>
                <td className="p-2 flex justify-center gap-3">
                  <FiEye className="text-yellow-400 cursor-pointer" />
                  <FiCheck
                    className="text-green-400 cursor-pointer"
                    onClick={mostrarModalAsignacion}
                  />
                  <FiX className="text-red-500 cursor-pointer" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
