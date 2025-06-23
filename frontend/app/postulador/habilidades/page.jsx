'use client';

import { useState, useEffect } from 'react';
import { Alert } from "../../components/alerts/alerts";
import { useRouter } from 'next/navigation';
import mostrarVacantesModal from '../../components/modals/VacanteModal';

export default function SeleccionHabilidades() {
  const router = useRouter();
  const [habilidades, setHabilidades] = useState([]);
  const [habilidadesSeleccionadas, setHabilidadesSeleccionadas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerHabilidades = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/configuracion/habilidad');
        const data = await res.json();
        if (Array.isArray(data)) setHabilidades(data);
        else throw new Error('La respuesta no es un array');
      } catch (error) {
        console.error('Error al cargar habilidades:', error);
        await Alert({
          title: 'Error',
          html: 'No se pudieron cargar las habilidades.',
          icon: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    obtenerHabilidades();
  }, []);

  const toggleHabilidad = (habilidad) => {
    const yaSeleccionada = habilidadesSeleccionadas.find(h => h.Id_Habilidad === habilidad.Id_Habilidad);
    if (yaSeleccionada) {
      setHabilidadesSeleccionadas(habilidadesSeleccionadas.filter(h => h.Id_Habilidad !== habilidad.Id_Habilidad));
    } else if (habilidadesSeleccionadas.length < 3) {
      setHabilidadesSeleccionadas([...habilidadesSeleccionadas, habilidad]);
    } else {
      Alert({ title: 'Máximo alcanzado', html: 'Solo puedes seleccionar hasta 3 habilidades.', icon: 'warning' });
    }
  };

  const handleContinuar = async () => {
    if (habilidadesSeleccionadas.length === 0) {
      await Alert({
        title: 'Error',
        html: 'Por favor selecciona al menos una habilidad.',
        icon: 'error'
      });
      return;
    }

    const confirm = await Alert({
      title: '¿Estás seguro que quieres continuar?',
      html: `
        <p class="text-white text-base font-medium mb-3">Has seleccionado:</p>
        <div class="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
          ${habilidadesSeleccionadas.map(h => `<span class="badge-habilidad">${h.Descripcion}</span>`).join('')}
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar'
    });

    if (!confirm.isConfirmed) return;

    const idPostulante = parseInt(localStorage.getItem('id_postulante'));
    if (!idPostulante || isNaN(idPostulante)) {
      await Alert({ title: 'Error', text: 'No se encontró el ID del postulante.', icon: 'error' });
      return;
    }

    try {
      await fetch('http://localhost:5000/api/postulante/habilidades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idPostulante,
          habilidades: habilidadesSeleccionadas.map(h => h.Id_Habilidad)
        })
      });

      const resVacantes = await fetch('http://localhost:5000/api/vacantes/por-habilidades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habilidades: habilidadesSeleccionadas.map(h => h.Id_Habilidad),
          idPostulante
        })
      });

      const vacantesData = await resVacantes.json();
      if (!vacantesData.length) {
        await Alert({
          title: 'Sin coincidencias',
          html: 'No hay vacantes para las habilidades seleccionadas.',
          icon: 'info'
        });
        return;
      }

     
      const vacanteSeleccionada = await mostrarVacantesModal({ vacantesData });

if (!vacanteSeleccionada) return;


      const confirmarAsignacion = await Alert({
        title: vacanteSeleccionada.Descripcion,
        html: `<div class="text-white text-sm">${vacanteSeleccionada.Contexto}</div>`,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Seleccionar esta vacante',
        cancelButtonText: 'Volver'
      });

      if (!confirmarAsignacion.isConfirmed) return;

      await fetch('http://localhost:5000/api/postulante/seleccionar-vacante', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idPostulante, idVacante: vacanteSeleccionada.Id_Vacante })
      });

      await Alert({
        title: '¡Proceso finalizado!',
        html: 'Tu selección ha sido registrada correctamente. Serás redirigido al inicio.',
        icon: 'success'
      });

      localStorage.removeItem('id_postulante');
      router.push('/');
    } catch (error) {
      console.error('Error en el proceso:', error);
      await Alert({
        title: 'Error',
        html: 'Ocurrió un error durante el proceso.',
        icon: 'error'
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pageBackground p-6 md:p-12 text-white">
      <h2 className="text-3xl md:text-4xl font-bold mb-3 text-center text-cyan-400">
        Selecciona tus fortalezas
      </h2>
      <p className="text-base md:text-lg text-gray-300 mb-2 text-center max-w-2xl">
        Elige hasta <span className="font-semibold text-white">3 habilidades</span> en las que te sientas más seguro.
      </p>
      <p className="text-sm md:text-base text-gray-400 mb-6 text-center max-w-xl">
        Estas serán la base para mostrarte vacantes alineadas a tu perfil.
      </p>

      <div className="flex flex-wrap justify-center gap-3 max-w-3xl mb-8">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="w-32 h-10 bg-gray-700 animate-pulse rounded-full" />
          ))
        ) : (
          habilidades.map((habilidad) => {
            const activa = habilidadesSeleccionadas.some(h => h.Id_Habilidad === habilidad.Id_Habilidad);
            return (
              <button
                key={habilidad.Id_Habilidad}
                onClick={() => toggleHabilidad(habilidad)}
                className={activa ? 'badge-habilidad' : 'badge-habilidad-inactiva'}
              >
                {habilidad.Descripcion}
              </button>
            );
          })
        )}
      </div>

      <button
        onClick={handleContinuar}
        disabled={habilidadesSeleccionadas.length === 0}
        className={`py-3 px-8 rounded-full font-semibold text-base transition-all duration-200 shadow-md
          ${habilidadesSeleccionadas.length === 0
            ? 'bg-gray-600 text-white cursor-not-allowed'
            : 'bg-transparent text-cyan-300 border border-cyan-400 hover:bg-cyan-900'}
        `}
      >
        Confirmar selección
      </button>
    </div>
  );
}
