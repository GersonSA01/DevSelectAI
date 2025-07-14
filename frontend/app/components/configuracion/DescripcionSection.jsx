
import React from 'react';

export default function DescripcionSection({ campos, formData, setFormData }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 mb-4">
      {campos
        .filter(campo => !campo.toLowerCase().includes('fech'))
        .map(campo => (
          <div key={campo}>
            <label className="block text-sm text-gray-300 mb-1 capitalize">
              {campo.replace(/([A-Z])/g, ' $1')}
            </label>
            <input
              value={formData[campo] || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, [campo]: e.target.value }))}
              className="w-full p-2 rounded bg-slate-900 text-white border border-slate-600"
              placeholder={`Ingrese ${campo}`}
            />
          </div>
        ))}
    </div>
  );
}
