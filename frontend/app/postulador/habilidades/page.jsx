'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from "jwt-decode";

import { Alert } from "../../components/alerts/Alerts";
import mostrarVacantesModal from '../../components/modals/VacanteModal';

const formatearFecha = (fecha) => {
  const d = new Date(fecha);
  d.setHours(d.getHours() + 5);
  return new Intl.DateTimeFormat('es-EC', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(d);
};

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
        if (!Array.isArray(data)) throw new Error('La respuesta no es un array');
        setHabilidades(data);
      } catch (error) {
        console.error('Error al cargar habilidades:', error);
        await Alert({ title: 'Error', html: 'No se pudieron cargar las habilidades.', icon: 'error' });
      } finally {
        setLoading(false);
      }
    };
    obtenerHabilidades();
  }, []);

  const toggleHabilidad = (habilidad) => {
    const yaSeleccionada = habilidadesSeleccionadas.some(h => h.Id_Habilidad === habilidad.Id_Habilidad);
    if (yaSeleccionada) {
      setHabilidadesSeleccionadas(prev => prev.filter(h => h.Id_Habilidad !== habilidad.Id_Habilidad));
    } else if (habilidadesSeleccionadas.length < 3) {
      setHabilidadesSeleccionadas(prev => [...prev, habilidad]);
    } else {
      Alert({ title: 'Máximo alcanzado', html: 'Solo puedes seleccionar hasta 3 habilidades.', icon: 'warning' });
    }
  };

  const handleContinuar = async () => {
    if (habilidadesSeleccionadas.length === 0) {
      await Alert({ title: 'Error', html: 'Por favor selecciona al menos una habilidad.', icon: 'error' });
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

    let idPostulante = null;
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No hay token");
      const decoded = jwtDecode(token);
      idPostulante = decoded.id;
      if (!idPostulante) throw new Error("ID no encontrado en el token");
    } catch (err) {
      console.error("Error al decodificar token:", err);
      await Alert({ title: "Error", text: "Token inválido. Inicia sesión nuevamente.", icon: "error" });
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

      if (!resVacantes.ok) throw new Error('Error al obtener vacantes');
      const vacantesData = await resVacantes.json();

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const vacantesFiltradas = vacantesData
        .filter(v => {
          const p = v.Programacion;
          if (!p) return false;

          const inicio = new Date(p.FechIniPostulacion);
          const fin = new Date(p.FechFinPostulacion);
          inicio.setHours(0, 0, 0, 0);
          fin.setHours(23, 59, 59, 999);

          return v.Cantidad > 0 && hoy >= inicio && hoy <= fin;
        })
        .map(v => ({
          ...v,
          Programacion: {
            ...v.Programacion,
            FechIniPostulacionFormateada: formatearFecha(v.Programacion.FechIniPostulacion),
            FechFinPostulacionFormateada: formatearFecha(v.Programacion.FechFinPostulacion),
          }
        }));

      if (!vacantesFiltradas.length) {
        await Alert({
          title: 'Sin coincidencias',
          html: 'No hay vacantes para las habilidades seleccionadas o están fuera del periodo de postulación.',
          icon: 'info'
        });
        return;
      }

      const vacanteSeleccionada = await mostrarVacantesModal({ vacantesData: vacantesFiltradas });
      if (!vacanteSeleccionada) return;

      await fetch('http://localhost:5000/api/postulante/seleccionar-vacante', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idPostulante, idVacante: vacanteSeleccionada.Id_Vacante })
      });

      await Alert({
        title: '¡Proceso finalizado!',
        html: 'Tu selección ha sido registrada correctamente. Por favor revisa tu correo para más detalles.',
        icon: 'success'
      });

      localStorage.removeItem('token');
      router.push('/');
    } catch (error) {
      console.error('Error en el proceso:', error);
      await Alert({ title: 'Error', html: 'Ocurrió un error durante el proceso.', icon: 'error' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pageBackground p-6 md:p-12 text-white ">

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
          habilidades.map(h => {
            const activa = habilidadesSeleccionadas.some(sel => sel.Id_Habilidad === h.Id_Habilidad);
            return (
              <button
                key={h.Id_Habilidad}
                onClick={() => toggleHabilidad(h)}
                className={activa ? 'badge-habilidad' : 'badge-habilidad-inactiva'}
              >
                {h.Descripcion}
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
            : 'bg-transparent text-cyan-300 border border-cyan-400 hover:bg-cyan-900'}`}
      >
        Confirmar selección
      </button>
    </div>
  );
}
