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
    if (habilidadesSeleccionadas.includes(habilidad)) {
      setHabilidadesSeleccionadas(habilidadesSeleccionadas.filter((h) => h !== habilidad));
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
      // Guardar habilidades seleccionadas
      await fetch('http://localhost:5000/api/postulante/habilidades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idPostulante,
          habilidades: habilidadesSeleccionadas.map(h => h.Id_Habilidad)
        })
      });

      // Buscar vacantes por habilidades
      const resVacantes = await fetch('http://localhost:5000/api/vacantes/por-habilidades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habilidades: habilidadesSeleccionadas.map(h => h.Id_Habilidad) })
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

      // ⚠️ IMPORTANTE: asegúrate de que esta ruta exista en el backend
      const resSeleccion = await fetch('http://localhost:5000/api/postulante/seleccionar-vacante', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idPostulante, idVacante: vacanteSeleccionada.Id_Vacante })
      });

      if (!resSeleccion.ok) throw new Error('Error al seleccionar vacante');

      await Alert({
        title: '¡Vacante asignada!',
        text: 'Has sido asignado a la vacante exitosamente. Revisa tu correo para continuar.',
        icon: 'success'
      });

      router.push('/instrucciones');
    } catch (error) {
      console.error('Error en el proceso:', error);
      await Alert({ title: 'Error', text: 'Ocurrió un error durante el proceso.', icon: 'error' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pageBackground p-8">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">Seleccione hasta 3 habilidades a evaluar</h2>

      <div className="flex flex-col gap-4 w-full max-w-md">
        {habilidades.map((habilidad) => (
          <button
            key={habilidad.Id_Habilidad}
            onClick={() => toggleHabilidad(habilidad)}
            className={`py-2 rounded font-semibold transition ${
              habilidadesSeleccionadas.includes(habilidad) ? 'bg-primaryButton text-white' : 'bg-white text-black'
            }`}
          >
            {habilidad.Descripcion}
          </button>
        ))}
      </div>

      <button
        onClick={handleContinuar}
        className="mt-8 bg-primaryButton hover:bg-primaryButtonHover text-white font-semibold py-2 px-8 rounded-full transition"
      >
        Continuar
      </button>
    </div>
  );
}
