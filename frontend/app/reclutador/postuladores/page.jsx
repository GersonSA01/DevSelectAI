'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiEye, FiCheck, FiX } from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function PostulacionesPage() {
  const router = useRouter();
  const [filtroNombre, setFiltroNombre] = useState('');
  const [itinerario, setItinerario] = useState('1');
  const [postulantes, setPostulantes] = useState([]);

  // ✅ Obtener postulantes desde el backend
  useEffect(() => {
    const fetchPostulantes = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/postulantes');
        const data = await res.json();
        setPostulantes(data);
      } catch (error) {
        console.error('Error al obtener postulantes:', error);
      }
    };

    fetchPostulantes();
  }, []);

  // ✅ Modal para asignar vacante
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

  // ✅ Rechazar postulante
  const rechazarPostulante = async (id) => {
    const confirmacion = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'El postulante será rechazado',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
      try {
        await fetch(`http://localhost:5000/api/postulantes/${id}/rechazar`, {
          method: 'PUT'
        });
        Swal.fire('Rechazado', 'El postulante ha sido rechazado.', 'success');
        setPostulantes(prev =>
          prev.map(p =>
            p.Id_Postulante === id ? { ...p, Estado: 'Rechazado' } : p
          )
        );
      } catch (error) {
        console.error('Error al rechazar:', error);
        Swal.fire('Error', 'No se pudo rechazar el postulante.', 'error');
      }
    }
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
              <th className="border border-gray-600 p-2">Habilidades</th>
              <th className="border border-gray-600 p-2">Calificación</th>
              <th className="border border-gray-600 p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {postulantes
              .filter(p => p.Nombre?.toLowerCase().includes(filtroNombre.toLowerCase()))
              .map((p, i) => (
                <tr key={i} className="border-t border-gray-700">
                  <td className="p-2">{p.Nombre} {p.Apellido}</td>
                  <td className="p-2">{p.Estado || '—'}</td>
                  <td className="p-2">
                    {p.habilidades?.map(h => h.habilidad?.Descripcion).join(', ') || '—'}
                  </td>
                  <td className="p-2">
                    {p.CalificacionEntrevista ? (
                      `${p.CalificacionEntrevista}/10`
                    ) : (
                      <button
                        className="bg-green-100 text-black px-2 py-1 rounded text-sm"
                        onClick={() =>
                          router.push(`/reclutador/evaluaciones?idPostulante=${p.Id_Postulante}`)
                        }
                      >
                        Comprobar calificación
                      </button>
                    )}
                  </td>
                  <td className="p-2 flex justify-center gap-3">
                    <FiEye
                      className="text-yellow-400 cursor-pointer"
                      onClick={() =>
                        router.push(`/reclutador/informes?idPostulante=${p.Id_Postulante}`)
                      }
                    />
                    <FiCheck
                      className="text-green-400 cursor-pointer"
                      onClick={() => mostrarModalAsignacion(p.Id_Postulante)}
                    />
                    <FiX
                      className="text-red-500 cursor-pointer"
                      onClick={() => rechazarPostulante(p.Id_Postulante)}
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
