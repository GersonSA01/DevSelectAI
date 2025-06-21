'use client';

import { useState, useEffect } from 'react';
import { Alert } from "../../components/alerts/alerts";
import { useRouter } from 'next/navigation';

export default function SeleccionHabilidades() {
  const router = useRouter();
  const [habilidades, setHabilidades] = useState([]);
  const [habilidadesSeleccionadas, setHabilidadesSeleccionadas] = useState([]);
  const [vacantes, setVacantes] = useState([]);

  useEffect(() => {
    const obtenerHabilidades = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/configuracion/habilidad');
        const data = await res.json();
        if (Array.isArray(data)) setHabilidades(data);
        else throw new Error('La respuesta no es un array');
      } catch (error) {
        console.error('Error al cargar habilidades:', error);
        await Alert({ title: 'Error', text: 'No se pudieron cargar las habilidades.', icon: 'error' });
      }
    };
    obtenerHabilidades();
  }, []);

  const toggleHabilidad = (habilidad) => {
    const yaSeleccionada = habilidadesSeleccionadas.find((h) => h.Id_Habilidad === habilidad.Id_Habilidad);
    if (yaSeleccionada) {
      setHabilidadesSeleccionadas(habilidadesSeleccionadas.filter((h) => h.Id_Habilidad !== habilidad.Id_Habilidad));
    } else if (habilidadesSeleccionadas.length < 3) {
      setHabilidadesSeleccionadas([...habilidadesSeleccionadas, habilidad]);
    } else {
      Alert({ title: 'Máximo alcanzado', text: 'Solo puedes seleccionar hasta 3 habilidades.', icon: 'warning' });
    }
  };

  const handleContinuar = async () => {
    if (habilidadesSeleccionadas.length === 0) {
      await Alert({ title: 'Error', text: 'Por favor selecciona al menos una habilidad.', icon: 'error' });
      return;
    }

    const confirm = await Alert({
      title: '¿Estás seguro que quieres continuar?',
      text: `Has seleccionado: ${habilidadesSeleccionadas.map(h => h.Descripcion).join(', ')}`,
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
      setVacantes(vacantesData);

      if (!vacantesData.length) {
        await Alert({ title: 'Sin coincidencias', text: 'No hay vacantes para las habilidades seleccionadas.', icon: 'info' });
        return;
      }

      const inputOptions = {};
      vacantesData.forEach(v => {
        inputOptions[v.Id_Vacante] = v.Descripcion;
      });

      const seleccion = await Alert({
        title: 'Vacantes disponibles',
        input: 'radio',
        inputOptions,
        inputValidator: (value) => !value && 'Debes seleccionar una vacante',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Ver más',
        cancelButtonText: 'Cancelar'
      });

      if (!seleccion.value) return;

      const vacanteSeleccionada = vacantesData.find(v => v.Id_Vacante === parseInt(seleccion.value));

      const confirmarAsignacion = await Alert({
        title: vacanteSeleccionada.Descripcion,
        text: vacanteSeleccionada.Contexto,
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
        text: 'Tu selección ha sido registrada correctamente. Serás redirigido al inicio.',
        icon: 'success'
      });

      localStorage.removeItem('id_postulante');
      router.push('/');

    } catch (error) {
      console.error('Error en el proceso:', error);
      await Alert({ title: 'Error', text: 'Ocurrió un error durante el proceso.', icon: 'error' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pageBackground p-6 md:p-12 text-white">
      <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">
        Elige tus 3 mejores habilidades
      </h2>
      <p className="text-sm md:text-base mb-6 text-center">
        Estas habilidades nos ayudarán a buscar vacantes adecuadas para ti.
      </p>

      {/* Chips de habilidades */}
      <div className="flex flex-wrap justify-center gap-3 max-w-3xl mb-8">
        {habilidades.map((habilidad) => {
          const activa = habilidadesSeleccionadas.some(h => h.Id_Habilidad === habilidad.Id_Habilidad);
          return (
            <button
              key={habilidad.Id_Habilidad}
              onClick={() => toggleHabilidad(habilidad)}
              className={`px-4 py-2 rounded-full border transition text-sm md:text-base
                ${activa ? 'bg-primaryButton text-white' : 'bg-white text-black hover:bg-gray-200'}`}
            >
              {habilidad.Descripcion}
            </button>
          );
        })}
      </div>

      {/* Botón de continuar */}
      <button
        onClick={handleContinuar}
        className="bg-primaryButton hover:bg-primaryButtonHover text-white font-semibold py-2 px-6 md:px-8 rounded-full transition text-sm md:text-base"
      >
        Continuar
      </button>
    </div>
  );
}
