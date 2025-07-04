'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SkeletonSidebar from './SkeletonSidebar';
import {
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  LogOut,
  Settings,
  User2,
  CheckCircle2,
} from 'lucide-react';
import { useItinerarios } from '../../context/ItinerarioContext';

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const [openSection, setOpenSection] = useState('vacantes');
  const [docente, setDocente] = useState(null);
  const router = useRouter();
  const { itinerarios } = useItinerarios();
  const [loading, setLoading] = useState(true);

  // ✅ Detectar tamaño de pantalla al cargar y colapsar si es móvil
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    handleResize(); // Ejecuta al montar
    window.addEventListener('resize', handleResize); // Reacciona a cambios

    return () => window.removeEventListener('resize', handleResize);
  }, [setIsCollapsed]);

  useEffect(() => {
    const reclutadorGuardado = localStorage.getItem('reclutador');
    if (reclutadorGuardado) {
      try {
        const datos = JSON.parse(reclutadorGuardado);
        const nombres = datos.nombres || datos.Nombres || '';
        const apellidos = datos.apellidos || datos.Apellidos || '';
        const id = datos.id || datos.Id_Reclutador || datos.Id_reclutador;
        setDocente({ nombres, apellidos, id });
      } catch (error) {
        console.error("⚠️ Error al leer reclutador desde localStorage:", error);
      }
    }
    setLoading(false);
  }, []);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleLogout = () => {
    localStorage.removeItem('reclutador');
    router.push('/');
  };

  if (loading) {
    return <SkeletonSidebar isCollapsed={isCollapsed} />;
  }

  return (
    <div className={`h-screen bg-[#0f172a] text-white transition-all duration-300 fixed top-16 left-0 z-40 ${isCollapsed ? 'w-16' : 'w-64'} border-r border-neutral-700`}>
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <div className="text-sm font-semibold">
              {docente ? `${docente.nombres} ${docente.apellidos}` : 'Cargando...'}
            </div>
            <div className="text-xs text-cyan-400">DOCENTE</div>
          </div>
        )}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-white ml-auto">
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      <nav className="px-2 space-y-1 text-sm">
        <div>
          <button
            onClick={() => toggleSection('vacantes')}
            className="flex items-center justify-between w-full py-2 px-3 rounded hover:bg-slate-800"
          >
            <span className="flex items-center gap-x-2">
              <CheckCircle2 size={18} />
              {!isCollapsed && 'Vacantes'}
            </span>
            {!isCollapsed && (
              openSection === 'vacantes' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
            )}
          </button>

          {!isCollapsed && openSection === 'vacantes' && (
            <div className="ml-7 space-y-1">
              {Array.isArray(itinerarios) && itinerarios.length > 0 ? (
                itinerarios.map((itinerario) => (
                  <Link
                    key={itinerario.id_Itinerario}
                    href={`/reclutador/vacantes?id=${itinerario.id_Itinerario}&descripcion=${itinerario.descripcion}`}
                    className="block py-1 hover:text-cyan-400"
                  >
                    {itinerario.descripcion}
                  </Link>
                ))
              ) : (
                <div className="text-sm text-neutral-400 italic">No hay itinerarios disponibles</div>
              )}
            </div>
          )}
        </div>

        <Link href="/reclutador/postuladores" className="flex items-center gap-x-2 py-2 px-3 rounded hover:bg-slate-800">
          <User2 size={18} />
          {!isCollapsed && 'Postulante'}
        </Link>

        <Link href="/reclutador/configuracion" className="flex items-center gap-x-2 py-2 px-3 rounded hover:bg-slate-800">
          <Settings size={18} />
          {!isCollapsed && 'Configuración'}
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-x-2 py-2 px-3 rounded hover:bg-red-800 text-red-500 mt-4 w-full text-left"
        >
          <LogOut size={18} />
          {!isCollapsed && 'Cerrar sesión'}
        </button>
      </nav>
    </div>
  );
}
