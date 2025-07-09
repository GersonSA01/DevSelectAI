'use client';

import { useState, useEffect } from 'react';
import ConfiguracionCard from '../../components/configuracion/ConfiguracionCard';
import SkeletonConfiguracion from '../../components/skeleton/SkeletonConfiguracion';

const modelos = [
  { titulo: 'Empresa', entidad: 'empresa', campos: ['Descripcion'] },
  { titulo: 'Habilidad', entidad: 'habilidad', campos: ['Descripcion'] },
  { titulo: 'Itinerario', entidad: 'itinerario', campos: ['descripcion'] },
  {
    titulo: 'Programación',
    entidad: 'programacion',
    campos: [
      'FechIniPostulacion',
      'FechFinPostulacion',
      'FechIniAprobacion',
      'FechFinAprobacion'
    ]
  }
];

export default function ConfiguracionPage() {
  const [activo, setActivo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula la carga inicial
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const manejarExpansión = (entidad) => {
    setActivo(prev => (prev === entidad ? null : entidad));
  };

  if (loading) return <SkeletonConfiguracion />;

  return (
    <div className="p-8 bg-[#0b1120] min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">Configuración</h1>

      <div className="flex flex-col gap-6">
        {modelos.map((modelo) => (
          <ConfiguracionCard
            key={modelo.entidad}
            titulo={modelo.titulo}
            entidad={modelo.entidad}
            campos={modelo.campos}
            expanded={activo === modelo.entidad}
            onExpand={() => manejarExpansión(modelo.entidad)}
          />
        ))}
      </div>
    </div>
  );
}
