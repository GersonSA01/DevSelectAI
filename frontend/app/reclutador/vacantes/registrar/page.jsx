'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert } from '../../../components/alerts/Alerts';
import { jwtDecode } from "jwt-decode";

function formatearFecha(fecha) {
  if (!fecha) return '';
  const soloFecha = fecha.slice(0, 10);
  const [a, m, d] = soloFecha.split('-');
  return `${d}/${m}/${a}`;
}



export default function RegistrarVacante() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idItinerario = searchParams.get('id');
  const descripcion = searchParams.get('descripcion');
  const idVacante = searchParams.get('idVacante');
  const esEdicion = Boolean(idVacante);

  const [nombre, setNombre] = useState('');
  const [vacantes, setVacantes] = useState('');
  const [contexto, setContexto] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [empresas, setEmpresas] = useState([]);
  const [habilidades, setHabilidades] = useState([]);
  const [habilidadesSeleccionadas, setHabilidadesSeleccionadas] = useState([]);
  const [idReclutador, setIdReclutador] = useState(null);
  const [programaciones, setProgramaciones] = useState([]);
  const [programacion, setProgramacion] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hab, emp, prog] = await Promise.all([
          fetch('http://localhost:5000/api/habilidades').then(r => r.json()),
          fetch('http://localhost:5000/api/empresas').then(r => r.json()),
          fetch('http://localhost:5000/api/programaciones').then(r => r.json())
        ]);
        setHabilidades(hab);
        setEmpresas(emp);
        setProgramaciones(prog);
      } catch (err) {
        console.error('❌ Error cargando datos iniciales:', err);
      }
    };
    fetchData();
  }, []);

useEffect(() => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ No hay token en localStorage');
      return;
    }

    const decoded = jwtDecode(token);
    const id = Number(decoded.id || decoded.Id_Reclutador || decoded.Id_reclutador);

    if (!isNaN(id)) {
      setIdReclutador(id);
      console.log(`✅ Reclutador ID obtenido del JWT: ${id}`);
    } else {
      console.error('⚠️ ID de reclutador no válido en el token');
    }
  } catch (err) {
    console.error('❌ Error al decodificar JWT:', err);
  }
}, []);

  useEffect(() => {
    if (!idVacante) return;
    const cargarVacante = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/vacantes/${idVacante}`);
        if (!res.ok) throw new Error(`Error ${res.status} al obtener vacante`);
        const vacante = await res.json();

        setNombre(vacante.Descripcion || '');
        setVacantes(vacante.Cantidad || '');
        setContexto(vacante.Contexto || '');
        setEmpresa(vacante.Id_Empresa || '');
        setProgramacion(vacante.Id_Programacion || '');

        if (habilidades.length > 0) {
          const seleccionadas = (vacante.habilidades || [])
            .map(idH => habilidades.find(h => h.Id_Habilidad === idH.Id_Habilidad || h.Id_Habilidad === idH))
            .filter(Boolean);
          setHabilidadesSeleccionadas(seleccionadas);
        }
      } catch (err) {
        console.error('❌ Error al cargar vacante para edición:', err);
      }
    };
    cargarVacante();
  }, [idVacante, habilidades.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!idReclutador) {
      await Alert({
        icon: 'error',
        title: 'Error',
        html: 'No se pudo identificar al reclutador. Por favor, vuelve a iniciar sesión.',
      });
      return;
    }

    try {
      const metodo = esEdicion ? 'PUT' : 'POST';
      const url = esEdicion
        ? `http://localhost:5000/api/vacantes/${idVacante}`
        : 'http://localhost:5000/api/vacantes';

      const nuevaVacante = {
        Id_Itinerario: Number(idItinerario),
        Descripcion: nombre,
        Cantidad: Number(vacantes),
        Contexto: contexto,
        Id_reclutador: Number(idReclutador),
        Id_Empresa: Number(empresa),
        habilidades: habilidadesSeleccionadas.map(h => Number(h.Id_Habilidad))
      };

      if (!esEdicion) {
        nuevaVacante.Id_Programacion = Number(programacion);
      }

      const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaVacante),
      });

      const data = await res.json();

      if (!res.ok) {
        await Alert({
          icon: 'error',
          title: 'Error',
          html: data.error || data.mensaje || 'No se pudo registrar la vacante.',
        });
        return;
      }

      await Alert({
        icon: 'success',
        title: esEdicion ? '¡Vacante actualizada!' : '¡Vacante registrada!',
        html: esEdicion
          ? 'La vacante ha sido actualizada correctamente.'
          : 'La vacante ha sido añadida correctamente.',
        confirmButtonColor: '#22c55e',
      });
      router.push(`/reclutador/vacantes?id=${idItinerario}&descripcion=${descripcion}`);
    } catch (err) {
      console.error(err);
      await Alert({
        icon: 'error',
        title: 'Error',
        html: 'No se pudo registrar la vacante.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-white p-8">
      <h1 className="text-3xl font-bold mb-6">
        {esEdicion ? 'EDITAR VACANTE' : `REGISTRAR VACANTE PARA "${descripcion}"`}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto bg-[#111827] p-8 rounded-xl shadow-lg border border-[#1f2937] space-y-4"
      >
        <div>
          <label className="block mb-1">Nombre de vacante:</label>
          <input
            className="w-full p-2 rounded bg-[#1e293b] text-white"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Vacantes disponibles:</label>
            <input
              type="number"
              className="w-full p-2 rounded bg-[#1e293b] text-white"
              value={vacantes}
              onChange={(e) => setVacantes(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1">Empresa:</label>
            <select
              className="w-full p-2 rounded bg-[#1e293b] text-white"
              value={empresa}
              onChange={(e) => setEmpresa(Number(e.target.value))}
            >
              <option value="">Seleccione una empresa</option>
              {empresas.map((e) => (
                <option key={e.Id_Empresa} value={e.Id_Empresa}>{e.Descripcion}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-1">
            Programación: {esEdicion && <span className="text-red-400 text-sm">(No editable, contacte a administración si requiere cambiarla)</span>}
          </label>
          <select
            className="w-full p-2 rounded bg-[#1e293b] text-white"
            value={programacion}
            disabled={esEdicion}
            onChange={(e) => setProgramacion(Number(e.target.value))}
          >
            <option value="">Seleccione una programación</option>
            {programaciones.map(p => (
              <option key={p.id_Programacion} value={p.id_Programacion}>
                {`Postulación: ${formatearFecha(p.FechIniPostulacion)} → ${formatearFecha(p.FechFinPostulacion)} | Aprobación: ${formatearFecha(p.FechIniAprobacion)} → ${formatearFecha(p.FechFinAprobacion)}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Habilidades requeridas (máx. 3):</label>
          <div className="flex flex-wrap gap-2">
            {habilidades.map((h) => {
              const seleccionada = habilidadesSeleccionadas.some(sel => sel.Id_Habilidad === h.Id_Habilidad);
              const puedeSeleccionar = seleccionada || habilidadesSeleccionadas.length < 3;

              return (
                <button
                  key={h.Id_Habilidad}
                  type="button"
                  onClick={() => {
                    if (seleccionada) {
                      setHabilidadesSeleccionadas(prev => prev.filter(x => x.Id_Habilidad !== h.Id_Habilidad));
                    } else if (puedeSeleccionar) {
                      setHabilidadesSeleccionadas(prev => [...prev, h]);
                    }
                  }}
                  className={`px-3 py-1 rounded-full border transition-all duration-200
                    ${seleccionada
                      ? 'bg-blue-600 text-white border-blue-400'
                      : 'bg-[#1e293b] text-white border-gray-500 hover:bg-blue-700'}`}
                >
                  {h.Descripcion}
                  {seleccionada && <span className="ml-2">✕</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block mb-1">Contexto:</label>
          <textarea
            className="w-full p-2 rounded bg-[#1e293b] text-white h-40 resize-y"
            value={contexto}
            onChange={(e) => setContexto(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-white w-full mt-4"
        >
          {esEdicion ? 'Actualizar vacante' : 'Guardar vacante'}
        </button>
      </form>
    </div>
  );
}
