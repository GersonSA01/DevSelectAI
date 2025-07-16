'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import SkeletonSidebar from './skeleton/SkeletonSidebar';

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
  const pathname = usePathname();
  const { itinerarios } = useItinerarios();
  const [loading, setLoading] = useState(true);

  // Detectar tamaño de pantalla para colapsar sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsCollapsed]);

  // Obtener usuario autenticado desde backend (/api/me)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/me`, {
          method: 'GET',
          credentials: 'include', // 👈 importante para que se envíen cookies
        });

        if (!res.ok) throw new Error('No autenticado');

        const data = await res.json();
        setDocente({
          nombres: data.usuario.nombres,
          correo: data.usuario.correo,
          id: data.usuario.id,
        });
      } catch (error) {
        console.error('🔒 No autenticado:', error);
        router.push('/auth/login_docente');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleLogout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    router.push('/');
  };

  if (loading) {
    return <SkeletonSidebar isCollapsed={isCollapsed} />;
  }

  return (
    <div
      className={`h-screen bg-[#0f172a] text-white transition-all duration-300 fixed top-16 left-0 z-40
      ${isCollapsed ? 'w-16 shadow-md' : 'w-64'} border-r border-neutral-700`}
    >
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <Link
              href="/reclutador"
              className="relative text-sm font-semibold text-white group transition-colors duration-300"
            >
              <span className="group-hover:text-cyan-400 transition-colors duration-300">
                {docente ? `${docente.nombres}` : 'Cargando...'}
              </span>
              <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-cyan-400 transition-all duration-300 group-hover:w-full" />
            </Link>
            <div className="text-xs text-cyan-400">Coordinador de práctica</div>
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
            className={`flex items-center w-full py-2 px-3 rounded hover:bg-slate-800 transition-all
            ${isCollapsed ? 'justify-center' : 'justify-between'} 
            ${pathname.includes('/reclutador/vacantes') ? 'bg-slate-800' : ''}`}
          >
            <span className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-x-2'}`}>
              <CheckCircle2 size={18} />
              {!isCollapsed && 'Vacantes'}
            </span>
            {!isCollapsed && (
              openSection === 'vacantes' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
            )}
          </button>

          {openSection === 'vacantes' && (
            <div className={`${isCollapsed ? 'ml-0 flex flex-col items-center' : 'ml-7'} space-y-1 transition-all`}>
              {Array.isArray(itinerarios) && itinerarios.length > 0 ? (
                itinerarios.map((itinerario, idx) => (
                  <Link
                    key={itinerario.id_Itinerario}
                    href={`/reclutador/vacantes?id=${itinerario.id_Itinerario}&descripcion=${itinerario.descripcion}`}
                    className={`block py-1 text-xs hover:text-cyan-400 transition-all
                      ${pathname.includes(`/reclutador/vacantes`) &&
                        pathname.includes(itinerario.id_Itinerario)
                        ? 'text-cyan-400 font-semibold'
                        : ''
                      }`}
                  >
                    {isCollapsed ? `It.${idx + 1}` : itinerario.descripcion}
                  </Link>
                ))
              ) : (
                <div className="text-sm text-neutral-400 italic">
                  {!isCollapsed && 'No hay itinerarios'}
                </div>
              )}
            </div>
          )}
        </div>

        <Link
          href="/reclutador/postuladores"
          className={`flex items-center w-full py-2 px-3 rounded hover:bg-slate-800 transition-all
            ${isCollapsed ? 'justify-center' : 'gap-x-2'} 
            ${pathname.startsWith('/reclutador/postuladores') ? 'bg-slate-800' : ''}`}
        >
          <User2 size={18} />
          {!isCollapsed && 'Postulante'}
        </Link>

        <Link
          href="/reclutador/configuracion"
          className={`flex items-center w-full py-2 px-3 rounded hover:bg-slate-800 transition-all
            ${isCollapsed ? 'justify-center' : 'gap-x-2'}
            ${pathname.startsWith('/reclutador/configuracion') ? 'bg-slate-800' : ''}`}
        >
          <Settings size={18} />
          {!isCollapsed && 'Configuración'}
        </Link>

        <button
          onClick={handleLogout}
          className={`flex items-center w-full py-2 px-3 rounded hover:bg-red-800 text-red-500 mt-4 transition-all
            ${isCollapsed ? 'justify-center' : 'gap-x-2'}`}
        >
          <LogOut size={18} />
          {!isCollapsed && 'Cerrar sesión'}
        </button>
      </nav>
    </div>
  );
}
