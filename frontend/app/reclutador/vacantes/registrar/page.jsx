'use client';

import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useRouter, useSearchParams } from 'next/navigation';

export default function RegistrarVacante() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idItinerario = searchParams.get('id');
  const descripcion = searchParams.get('descripcion');
const [idVacante, setIdVacante] = useState(null);

useEffect(() => {
  const nuevaId = searchParams.get('idVacante');
  setIdVacante(nuevaId);
}, [searchParams]);
  const esEdicion = Boolean(idVacante);

  const [nombre, setNombre] = useState('');
  const [vacantes, setVacantes] = useState('');
  const [contexto, setContexto] = useState('');
  const [nivel, setNivel] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [niveles, setNiveles] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [habilidades, setHabilidades] = useState([]);
  const [habilidadesSeleccionadas, setHabilidadesSeleccionadas] = useState([]);
  const [idReclutador, setIdReclutador] = useState(null);

  // Obtener ID del reclutador desde localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const reclutadorGuardado = localStorage.getItem('reclutador');
      if (reclutadorGuardado) {
        try {
          const datos = JSON.parse(reclutadorGuardado);
          const id = parseInt(datos.Id_Reclutador ?? datos.id ?? datos.Id_reclutador ?? NaN);
          if (!isNaN(id)) {
            setIdReclutador(id);
          } else {
            console.warn('⚠️ No se encontró el Id del reclutador en:', datos);
          }
        } catch (error) {
          console.error('⚠️ Error al extraer ID del reclutador:', error);
        }
      }
    }
  }, []);

  // Cargar habilidades disponibles
  useEffect(() => {
    const fetchData = async () => {
      const resHabilidades = await fetch('http://localhost:5000/api/habilidades');
      const dataHabilidades = await resHabilidades.json();
      setHabilidades(dataHabilidades);
    };
    fetchData();
  }, []);

  // Cargar niveles y empresas
  useEffect(() => {
    const fetchNiveles = async () => {
      const res = await fetch('http://localhost:5000/api/niveles');
      const data = await res.json();
      setNiveles(data);
    };

    const fetchEmpresas = async () => {
      const res = await fetch('http://localhost:5000/api/empresas');
      const data = await res.json();
      setEmpresas(data);
    };

    fetchNiveles();
    fetchEmpresas();
  }, []);

useEffect(() => {
  const cargarVacante = async () => {
    if (!idVacante || habilidades.length === 0) return;

    try {
      const res = await fetch(`http://localhost:5000/api/vacantes/${idVacante}`);
      const vacante = await res.json();
      setNombre(vacante.Descripcion);
      setVacantes(vacante.Cantidad);
      setContexto(vacante.Contexto);
      setNivel(vacante.id_nivel);
      setEmpresa(vacante.Id_Empresa);

      // Espera a que las habilidades estén cargadas
      const habilidadesVacante = vacante.habilidades || [];
      const seleccionadas = habilidadesVacante.map(idH => {
        return habilidades.find(h => h.Id_Habilidad === idH.Id_Habilidad || h.Id_Habilidad === idH);
      }).filter(Boolean); // Filtra valores nulos o indefinidos

      setHabilidadesSeleccionadas(seleccionadas);
    } catch (err) {
      console.error('Error al cargar vacante para edición:', err);
    }
  };

  cargarVacante();
}, [idVacante, habilidades]);



  // Enviar datos al backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!idReclutador) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo identificar al reclutador. Por favor, vuelve a iniciar sesión.',
      });
      return;
    }

    if (!nombre || !vacantes || !contexto || !nivel || !empresa || habilidadesSeleccionadas.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos antes de guardar.',
      });
      return;
    }

    try {
      const metodo = esEdicion ? 'PUT' : 'POST';
      const url = esEdicion
        ? `http://localhost:5000/api/vacantes/${idVacante}`
        : 'http://localhost:5000/api/vacantes';

      const nuevaVacante = {
        Id_Itinerario: parseInt(idItinerario),
        Descripcion: nombre,
        Cantidad: parseInt(vacantes),
        Contexto: contexto,
        Id_reclutador: parseInt(idReclutador),
        Id_Empresa: Number(empresa),
        id_nivel: Number(nivel),
        habilidades: habilidadesSeleccionadas.map(h => parseInt(h.Id_Habilidad)),
      };

      const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaVacante),
      });

      if (!res.ok) throw new Error('Error al registrar vacante');

      Swal.fire({
        icon: 'success',
        title: esEdicion ? '¡Vacante actualizada!' : '¡Vacante registrada!',
        text: esEdicion ? 'La vacante ha sido actualizada correctamente.' : 'La vacante ha sido añadida correctamente.',
        confirmButtonColor: '#22c55e',
      }).then(() => {
        router.push(`/reclutador/vacantes?id=${idItinerario}&descripcion=${descripcion}`);
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo registrar la vacante.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-white p-8">
      <h1 className="text-3xl font-bold mb-6">
        {esEdicion ? 'EDITAR VACANTE' : `REGISTRAR VACANTE PARA "${descripcion}"`}
      </h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-[#111827] p-6 rounded shadow">
        <label className="block mb-2">Nombre de vacante:</label>
        <input className="w-full p-2 rounded mb-4 text-black" value={nombre} onChange={(e) => setNombre(e.target.value)} />

        <label className="block mb-2">Vacantes disponibles:</label>
        <input type="number" className="w-full p-2 rounded mb-4 text-black" value={vacantes} onChange={(e) => setVacantes(e.target.value)} />

        <label className="block mb-2">Contexto:</label>
        <textarea className="w-full p-2 rounded mb-4 text-black" value={contexto} onChange={(e) => setContexto(e.target.value)} />

        <label className="block mb-2">Nivel requerido:</label>
        <select className="w-full p-2 rounded mb-4 text-black" value={nivel} onChange={(e) => setNivel(Number(e.target.value))}>
          <option value="">Seleccione un nivel</option>
          {niveles.map((n) => (
            <option key={n.id_Nivel} value={n.id_Nivel}>{n.descripcion}</option>
          ))}
        </select>

        <label className="block mb-2">Empresa:</label>
        <select className="w-full p-2 rounded mb-4 text-black" value={empresa} onChange={(e) => setEmpresa(Number(e.target.value))}>
          <option value="">Seleccione una empresa</option>
          {empresas.map((e) => (
            <option key={e.Id_Empresa} value={e.Id_Empresa}>{e.Descripcion}</option>
          ))}
        </select>

        <label className="block mb-2">Habilidades requeridas (máx. 3):</label>
        <div className="flex flex-wrap gap-2 mb-4">
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
                  ${seleccionada ? 'bg-blue-600 text-white border-blue-400' : 'bg-white text-black border-gray-400'}
                  hover:scale-105`}
              >
                {h.Descripcion}
                {seleccionada && <span className="ml-2">✕</span>}
              </button>
            );
          })}
        </div>

        <button type="submit" className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-white">
          {esEdicion ? 'Actualizar vacante' : 'Guardar vacante'}
        </button>
      </form>
    </div>
  );
}
