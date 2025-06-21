'use client';
import React from 'react';

export default function TablaGeneral({ columnas, filas }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-700 shadow-md">
      <table className="min-w-[900px] w-full text-sm text-left">
        <thead className="bg-[#1E293B] text-gray-300 uppercase">
          <tr>
            {columnas.map((col, idx) => (
              <th key={idx} className="px-6 py-4">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-[#0f172a] divide-y divide-gray-700 text-white">
          {filas.length > 0 ? (
            filas.map((fila, i) => (
              <tr key={i} className="hover:bg-[#1e293b] transition">
                {fila.map((celda, j) => (
                  <td key={j} className="px-6 py-4">{celda}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columnas.length} className="text-center py-6 text-gray-400">
                No hay datos disponibles.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
