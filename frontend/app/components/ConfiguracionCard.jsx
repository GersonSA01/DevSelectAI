'use client';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, PlusCircle, Trash2, Pencil } from 'lucide-react';
import { useItinerarios } from '../../context/ItinerarioContext';

export default function ConfiguracionCard({ titulo, entidad, campos, expanded, onExpand }) {
  const API_URL = `http://localhost:5000/api/configuracion`;

  const [formData, setFormData] = useState({});
  const [registros, setRegistros] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
const { cargarItinerarios } = useItinerarios();

  const contentRef = useRef(null);

  const getId = (obj) => {
    const clave = Object.keys(obj).find(k => k.toLowerCase().startsWith('id_'));
    return obj[clave];
  };

  const cargarRegistros = async () => {
    try {
      const res = await fetch(`${API_URL}/${entidad}`);
      const data = await res.json();
      setRegistros(data);
    } catch (err) {
      console.error('Error cargando registros:', err);
    }
  };

  useEffect(() => {
    if (expanded) {
      cargarRegistros();
    }
  }, [expanded]);

  const handleInputChange = (campo, valor) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  const handleGuardar = async () => {
    try {
      const metodo = editandoId ? 'PUT' : 'POST';
      const url = editandoId ? `${API_URL}/${entidad}/${editandoId}` : `${API_URL}/${entidad}`;
      const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Error en guardado');

      // recarga los registros después de guardar
      await cargarRegistros();
      await cargarItinerarios(); // 🔄 actualiza el sidebar

      setFormData({});
      setEditandoId(null);

    } catch (err) {
      console.error('Error al guardar:', err);
    }
  };

  const handleEliminar = async (id) => {
    try {
      await fetch(`${API_URL}/${entidad}/${id}`, { method: 'DELETE' });
      await cargarRegistros();
      await cargarItinerarios();

    } catch (err) {
      console.error('Error al eliminar:', err);
    }
  };

  return (
    <div className="bg-slate-800 rounded shadow p-4 w-full">
      <div className="flex justify-between items-center cursor-pointer" onClick={onExpand}>
        <h2 className="text-lg font-bold text-white">{titulo}</h2>
        {expanded ? <ChevronUp /> : <ChevronDown />}
      </div>

      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-500"
        style={{ maxHeight: expanded ? '1000px' : '0px' }}
      >
        <div className="mt-4 space-y-3 mb-4">
          {campos.map((campo, i) => (
            <div key={campo}>
              <label className="block text-sm text-gray-300 mb-1 capitalize">{campo}</label>
              <input
                value={formData[campo] || ''}
                onChange={(e) => handleInputChange(campo, e.target.value)}
                className="w-full p-2 rounded bg-slate-900 text-white border border-slate-600"
              />
            </div>
          ))}

          <div className="flex gap-4">
            <button
              onClick={handleGuardar}
              className={`${
                editandoId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-cyan-500 hover:bg-cyan-600'
              } text-white px-4 py-2 rounded flex items-center gap-2`}
            >
              {editandoId ? (
                <>
                  <Pencil size={18} /> Guardar cambios
                </>
              ) : (
                <>
                  <PlusCircle size={18} /> Registrar
                </>
              )}
            </button>

            {editandoId && (
              <button
                onClick={() => {
                  setFormData({});
                  setEditandoId(null);
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        <table className="w-full text-sm text-left mt-4 border border-slate-600">
          <thead className="bg-slate-700">
            <tr>
              {campos.map(campo => (
                <th key={campo} className="p-2 border border-slate-600 capitalize">{campo}</th>
              ))}
              <th className="p-2 border border-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((registro) => (
              <tr key={getId(registro)} className="border border-slate-700">
                {campos.map((campo) => (
                  <td key={campo} className="p-2 text-white">{registro[campo]}</td>
                ))}
                <td className="p-2 flex gap-2">
                  <Pencil
                    className="text-yellow-400 cursor-pointer"
                    size={16}
                    onClick={() => {
                      setFormData(registro);
                      setEditandoId(getId(registro));
                    }}
                  />
                  <Trash2
                    className="text-red-500 cursor-pointer"
                    size={16}
                    onClick={() => handleEliminar(getId(registro))}
                  />
                </td>
              </tr>
            ))}
            {registros.length === 0 && (
              <tr>
                <td colSpan={campos.length + 1} className="p-2 text-center text-gray-400">
                  Sin registros aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
