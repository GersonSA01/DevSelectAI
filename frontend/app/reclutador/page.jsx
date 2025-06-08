'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User2, CheckCircle2, PlusCircle, Settings, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useItinerarios } from '../../context/ItinerarioContext';

export default function ReclutadorDashboard() {
  const [nombreDocente, setNombreDocente] = useState('Docente');
  const [mostrarItinerarios, setMostrarItinerarios] = useState(false);
  const { itinerarios, cargarItinerarios } = useItinerarios();

  useEffect(() => {
    const reclutadorGuardado = localStorage.getItem('reclutador');
    if (reclutadorGuardado) {
      try {
        const datos = JSON.parse(reclutadorGuardado);
        const nombres = datos.nombres || datos.Nombres || '';
        const apellidos = datos.apellidos || datos.Apellidos || '';
        setNombreDocente(`${nombres} ${apellidos}`);
      } catch (error) {
        console.error('⚠️ Error al obtener nombre del reclutador:', error);
      }
    }
  }, []);

  const toggleItinerarios = () => {
    setMostrarItinerarios(prev => !prev);
    if (itinerarios.length === 0) {
      cargarItinerarios();
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Bienvenido, {nombreDocente}</h1>
      <p className="text-gray-400 mb-8">Panel de administración de prácticas preprofesionales</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Postulantes */}
        <Link href="/reclutador/postuladores" className="bg-slate-800 p-6 rounded shadow hover:bg-slate-700 transition">
          <div className="flex items-center gap-4">
            <User2 size={32} className="text-cyan-400" />
            <div>
              <h2 className="text-xl font-semibold">Postulantes</h2>
              <p className="text-sm text-gray-400">Revisa perfiles y respuestas</p>
            </div>
          </div>
        </Link>

        {/* Vacantes */}
        <div
          onClick={toggleItinerarios}
          className="bg-slate-800 p-6 rounded shadow hover:bg-slate-700 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CheckCircle2 size={32} className="text-green-400" />
              <div>
                <h2 className="text-xl font-semibold">Vacantes</h2>
                <p className="text-sm text-gray-400">Consulta por itinerario</p>
              </div>
            </div>
            <ChevronDown className={`transition-transform duration-300 ${mostrarItinerarios ? 'rotate-180' : ''}`} />
          </div>

          <AnimatePresence>
            {mostrarItinerarios && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 space-y-2 text-sm text-white"
              >
                {Array.isArray(itinerarios) && itinerarios.length === 0 ? (
                  <li className="px-3 py-2 text-center text-gray-400 italic">No hay itinerarios disponibles</li>
                ) : (
itinerarios.map((itinerario) => (
                    <li key={itinerario.id_Itinerario}>
                       <Link
    
    href={`/reclutador/vacantes?id=${itinerario.id_Itinerario}&descripcion=${itinerario.descripcion}`}
                        className="block px-3 py-2 bg-slate-700 rounded hover:bg-slate-600 transition"
                      >
                        {itinerario.descripcion}

                      </Link>
                    </li>
                  ))
                )}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* Configuración */}
        <Link href="/reclutador/configuracion" className="bg-slate-800 p-6 rounded shadow hover:bg-slate-700 transition">
          <div className="flex items-center gap-4">
            <Settings size={32} className="text-white" />
            <div>
              <h2 className="text-xl font-semibold">Configuración</h2>
              <p className="text-sm text-gray-400">Administrar parámetros del sistema</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
