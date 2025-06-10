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

  useEffect(() => {
    const fetchPostulantes = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/postulantes');
        const data = await res.json();
        console.log('🔍 Datos recibidos:', data);
        if (Array.isArray(data)) setPostulantes(data);
        else if (Array.isArray(data.postulantes)) setPostulantes(data.postulantes);
        else setPostulantes([]);
      } catch (error) {
        console.error('Error al obtener postulantes:', error);
        setPostulantes([]);
      }
    };

    fetchPostulantes();
  }, []);

  const aceptarPostulante = async (id, nombre, vacante) => {
    const confirmacion = await Swal.fire({
      title: `¿Aceptar a ${nombre}?`,
      text: `El postulante será aprobado para la vacante "${vacante}"`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#22c55e',
      confirmButtonText: 'Aprobar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
      try {
        await fetch(`http://localhost:5000/api/postulantes/${id}/aceptar`, { method: 'PUT' });
        Swal.fire('✅ Aprobado', `${nombre} fue aprobado para "${vacante}"`, 'success');
        setPostulantes(prev =>
          prev.map(p =>
            p.Id_Postulante === id ? { ...p, Estado: 'Aprobado' } : p
          )
        );
      } catch (error) {
        console.error('Error al aprobar:', error);
        Swal.fire('Error', 'No se pudo aprobar al postulante.', 'error');
      }
    }
  };

  const rechazarPostulante = async (id) => {
    const confirmacion = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'El postulante será rechazado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
      try {
        await fetch(`http://localhost:5000/api/postulantes/${id}/rechazar`, { method: 'PUT' });
        Swal.fire('❌ Rechazado', 'El postulante ha sido rechazado.', 'success');
        setPostulantes(prev =>
          prev.map(p =>
            p.Id_Postulante === id ? { ...p, Estado: 'Rechazado' } : p
          )
        );
      } catch (error) {
        console.error('Error al rechazar:', error);
        Swal.fire('Error', 'No se pudo rechazar al postulante.', 'error');
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
              <th className="border p-2">Nombre</th>
              <th className="border p-2">Estado</th>
              <th className="border p-2">Vacante</th>
              <th className="border p-2">Habilidades</th>
              <th className="border p-2">Calificación</th>
              <th className="border p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {postulantes
              .filter(p => `${p.Nombre} ${p.Apellido}`.toLowerCase().includes(filtroNombre.toLowerCase()))
              .map((p, i) => (
                <tr key={i} className="border-t border-gray-700">
                  <td className="p-2">{p.Nombre} {p.Apellido}</td>
                  <td className="p-2">{p.Estado || '—'}</td>
                  <td className="p-2">{p.PostulanteVacantes?.[0]?.vacante?.Descripcion || '—'}</td>
                  <td className="p-2">
                    {(p.habilidades || []).map(h => h.habilidad?.Descripcion).join(', ') || '—'}
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
                      title="Aprobar postulante"
                      onClick={() =>
                        aceptarPostulante(p.Id_Postulante, `${p.Nombre} ${p.Apellido}`, p.vacante?.Descripcion || 'vacante')
                      }
                    />
                    <FiX
                      className="text-red-500 cursor-pointer"
                      title="Rechazar postulante"
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
