import React from 'react';

export default function PostulacionesSkeleton() {
  return (
    <div className="min-h-screen bg-[#0b1120] text-white p-4 sm:p-6 md:p-8 overflow-x-hidden animate-pulse">
      
      <div className="h-8 w-48 bg-slate-700 rounded mb-6" />

      
      <div className="bg-[#1E293B] p-4 rounded-lg mb-4 shadow-md">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <div className="h-5 w-40 bg-slate-700 rounded mb-2" />
            <div className="h-10 w-full bg-slate-800 rounded" />
          </div>
          <div>
            <div className="h-5 w-40 bg-slate-700 rounded mb-2" />
            <div className="h-8 w-48 bg-slate-800 rounded" />
          </div>
        </div>
      </div>

      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center bg-slate-800 rounded-xl p-4 shadow">
            <div className="bg-slate-700 p-3 rounded-full text-xl w-10 h-10" />
            <div className="ml-4">
              <div className="h-3 w-24 bg-slate-700 rounded mb-2" />
              <div className="h-6 w-10 bg-slate-700 rounded" />
            </div>
          </div>
        ))}
      </div>

      
      <div className="bg-[#1E293B] p-4 rounded-lg mb-4 shadow-md flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
          <div className="h-4 w-20 bg-slate-700 rounded mb-2" />
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-md shadow-inner w-56">
            <div className="w-4 h-4 bg-slate-700 rounded-full" />
            <div className="h-4 w-32 bg-slate-700 rounded" />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
          <div className="h-4 w-20 bg-slate-700 rounded mb-2" />
          <div className="h-8 w-40 bg-slate-800 rounded" />
        </div>
      </div>

      
      <div className="overflow-x-auto rounded-xl bg-slate-900 border border-slate-800 shadow">
        <table className="min-w-full divide-y divide-slate-800">
          <thead>
            <tr>
              {['Fecha de Postulación', 'Nombre', 'Vacante Escogida', 'Habilidades', 'Estado / Calificación', 'Acciones'].map((col, idx) => (
                <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  <div className="h-4 w-24 bg-slate-700 rounded" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {[...Array(3)].map((_, idx) => (
              <tr key={idx}>
                {Array(6).fill(0).map((_, j) => (
                  <td key={j} className="px-6 py-4">
                    <div className="h-4 w-full bg-slate-700 rounded" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}