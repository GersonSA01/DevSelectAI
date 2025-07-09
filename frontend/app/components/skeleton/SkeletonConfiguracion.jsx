import React from 'react';

export default function SkeletonConfiguracion() {
  return (
    <div className="p-8 bg-[#0b1120] min-h-screen text-white animate-pulse">
      <h1 className="text-3xl font-bold mb-6">Configuración</h1>

      <div className="flex flex-col gap-6">
        {[1, 2, 3, 4].map((_, idx) => (
          <div
            key={idx}
            className="h-12 bg-[#1f2937] rounded-md w-full"
          />
        ))}
      </div>
    </div>
  );
}
