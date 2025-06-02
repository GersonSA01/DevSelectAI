'use client';

import { useState, useEffect } from 'react';
import { Alert } from "../../components/alerts/alerts";
import { useRouter } from 'next/navigation';

export default function SeleccionHabilidades() {
  const router = useRouter();
  const [habilidades, setHabilidades] = useState([]);
  const [habilidadesSeleccionadas, setHabilidadesSeleccionadas] = useState([]);

  useEffect(() => {
    const obtenerHabilidades = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/configuracion/habilidad');
        const data = await res.json();

        if (Array.isArray(data)) {
          setHabilidades(data);
        } else {
          throw new Error('La respuesta no es un array');
        }
      } catch (error) {
        console.error('Error al cargar habilidades:', error);
        await Alert({
          title: 'Error',
          text: 'No se pudieron cargar las habilidades.',
          icon: 'error'
        });
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
      Alert({
        title: 'Máximo alcanzado',
        text: 'Solo puedes seleccionar hasta 3 habilidades.',
        icon: 'warning'
      });
    }
  };

  const handleContinuar = async () => {
    if (habilidadesSeleccionadas.length === 0) {
      await Alert({
        title: 'Error',
        text: 'Por favor selecciona al menos una habilidad.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    const result = await Alert({
      title: '¿Estás seguro que quieres continuar?',
      text: `Has seleccionado: ${habilidadesSeleccionadas.map(h => h.Descripcion).join(', ')}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar'
    });

    if (!result.isConfirmed) return;

    const idPostulante = parseInt(localStorage.getItem('id_postulante'));

    if (!idPostulante || isNaN(idPostulante)) {
      await Alert({
        title: 'Error',
        text: 'No se encontró el ID del postulante. Asegúrate de haber iniciado sesión.',
        icon: 'error'
      });
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/postulante/habilidades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idPostulante,
          habilidades: habilidadesSeleccionadas.map(h => h.Id_Habilidad)
        })
      });

      const data = await res.json();

      if (res.ok) {
        await Alert({
          title: '¡Correo enviado!',
          text: 'Te hemos enviado un correo con el enlace para iniciar tu entrevista.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          allowOutsideClick: false,
          allowEscapeKey: false
        });

        // Puedes redirigir si lo deseas
        // router.push('/instrucciones');
      } else {
        await Alert({
          title: 'Error',
          text: data.error || 'Hubo un problema al guardar las habilidades.',
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('Error al enviar habilidades:', error);
      await Alert({
        title: 'Error',
        text: 'No se pudo conectar con el servidor.',
        icon: 'error'
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pageBackground p-8">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">
        Seleccione hasta 3 habilidades a evaluar
      </h2>

      <div className="flex flex-col gap-4 w-full max-w-md">
        {habilidades.map((habilidad) => (
          <button
            key={habilidad.Id_Habilidad}
            onClick={() => toggleHabilidad(habilidad)}
            className={`py-2 rounded font-semibold transition ${
              habilidadesSeleccionadas.includes(habilidad)
                ? 'bg-primaryButton text-white'
                : 'bg-white text-black'
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
