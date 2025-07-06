'use client';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, PlusCircle, Trash2, Pencil } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useItinerarios } from '../../../context/ItinerarioContext';
import { es } from 'date-fns/locale';
import FechasSection from './FechasSection';
import DescripcionSection from './DescripcionSection';

export default function ConfiguracionCard({ titulo, entidad, campos, expanded, onExpand }) {
  const API_URL = `http://localhost:5000/api/configuracion`;
  const [formData, setFormData] = useState({});
  const [registros, setRegistros] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const { cargarItinerarios } = useItinerarios();
  const [diasPostulacion, setDiasPostulacion] = useState(null);
  const [diasAprobacion, setDiasAprobacion] = useState(null);

  const parseLocalDate = (str) => {
  const [y, m, d] = str.split('-');
  return new Date(Number(y), Number(m) - 1, Number(d));
};


  const getId = (obj) =>
    Object.entries(obj).find(([k]) => k.toLowerCase().startsWith('id_'))?.[1];

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
    if (expanded) cargarRegistros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  const handleGuardar = async () => {
    // Normaliza una fecha a año-mes-día (sin hora)
    const normalizar = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const fechaPostIni = new Date(formData['FechIniPostulacion']);
    const fechaPostFin = new Date(formData['FechFinPostulacion']);
    const fechaAprobIni =
      formData['FechIniAprobacion'] && new Date(formData['FechIniAprobacion']);

    // Validaciones usando fechas normalizadas
    if (normalizar(fechaPostIni) < normalizar(new Date())) {
      alert('La fecha de inicio de postulación no puede ser menor a hoy.');
      return;
    }

    if (normalizar(fechaPostIni) > normalizar(fechaPostFin)) {
      alert('La fecha de inicio de postulación no puede ser posterior a la fecha fin de postulación.');
      return;
    }

    if (fechaAprobIni && normalizar(fechaAprobIni) < normalizar(fechaPostFin)) {
      alert('Las fechas de aprobación no pueden ser anteriores a la fecha fin de postulación.');
      return;
    }

  const prepararPayload = () => {
  const payload = { ...formData };
  Object.keys(payload).forEach((key) => {
    if (payload[key] instanceof Date) {
      // aquí decides qué campos quieres que sumen 1 día
      let date = new Date(payload[key]);

      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      payload[key] = `${yyyy}-${mm}-${dd}`;
    }
  });
  return payload;
};


    try {
      const metodo = editandoId ? 'PUT' : 'POST';
      const url = editandoId
        ? `${API_URL}/${entidad}/${editandoId}`
        : `${API_URL}/${entidad}`;
      const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prepararPayload()),
      });
      if (!res.ok) throw new Error('Error en guardado');
      await cargarRegistros();
      await cargarItinerarios();
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

  const setFecha = (campo, fecha) => {
    setFormData((prev) => ({
      ...prev,
      [campo]: fecha || null,
    }));
  };

  // función auxiliar para calcular diferencia en días
  const diasEntre = (inicio, fin) => {
    if (!inicio || !fin) return null;
    const d1 = new Date(inicio);
    const d2 = new Date(fin);
    const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : null;
  };

  const fechaPostIni = formData['FechIniPostulacion']
    ? new Date(formData['FechIniPostulacion'])
    : null;
  const fechaPostFin = formData['FechFinPostulacion']
    ? new Date(formData['FechFinPostulacion'])
    : null;

  useEffect(() => {
    if (fechaPostIni && fechaPostFin) {
      setDiasPostulacion(diasEntre(fechaPostIni, fechaPostFin) + 1); // +1 para incluir ambos días
    } else {
      setDiasPostulacion(null);
    }

    if (formData['FechIniAprobacion'] && formData['FechFinAprobacion']) {
      setDiasAprobacion(
        diasEntre(
          new Date(formData['FechIniAprobacion']),
          new Date(formData['FechFinAprobacion'])
        ) + 1
      );
    } else {
      setDiasAprobacion(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const renderCampoFecha = (campo, minDateExtra) => {
    const fechaActual = formData[campo] ? new Date(formData[campo]) : null;

    let minDate = minDateExtra || null;

    if (campo === 'FechIniPostulacion') {
      minDate = new Date(); // hoy
    }
    if (campo === 'FechFinPostulacion' && fechaPostIni) {
      minDate = new Date(fechaPostIni.getTime() + 86400000); // +1 día
    }
    if (campo.toLowerCase().includes('aprobacion') && fechaPostFin) {
      minDate = new Date(fechaPostFin.getTime() + 86400000); // +1 día
    }

    const invalido =
      (campo === 'FechIniPostulacion' &&
        fechaActual &&
        fechaActual < new Date().setHours(0, 0, 0, 0)) ||
      (campo === 'FechFinPostulacion' &&
        fechaPostIni &&
        fechaActual < fechaPostIni) ||
      (campo.toLowerCase().includes('aprobacion') &&
        fechaPostFin &&
        fechaActual < fechaPostFin);

    return (
      <div key={campo}>
        <label className="block text-sm text-gray-300 mb-1 capitalize">
          {campo.replace(/([A-Z])/g, ' $1')}
        </label>
        <DatePicker
          locale={es}
          selected={fechaActual}
          onChange={(date) => setFecha(campo, date)}
          dateFormat="dd MMMM yyyy"
          placeholderText="Selecciona una fecha"
          className={`w-full px-3 py-2 rounded bg-slate-900 text-white border ${
            invalido ? 'border-red-500' : 'border-slate-600'
          } focus:outline-none`}
          minDate={minDate}
          title={invalido ? 'Verifica que las fechas sean coherentes' : ''}

        />
        {invalido && (
          <p className="text-xs text-red-400 mt-1">
            Verifica que esta fecha sea coherente
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="bg-slate-800 rounded shadow p-4 w-full">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={onExpand}
      >
        <h2 className="text-lg font-bold text-white">{titulo}</h2>
        {expanded ? <ChevronUp /> : <ChevronDown />}
      </div>

      <div
        className={`overflow-hidden transition-all duration-500 ${
          expanded ? 'mt-4' : ''
        }`}
        style={{ maxHeight: expanded ? '1500px' : '0px' }}
      >
        {expanded && (
          <>
            {campos.some((c) => c.toLowerCase().includes('fech')) && (
              <FechasSection
                diasPostulacion={diasPostulacion}
                diasAprobacion={diasAprobacion}
                renderCampoFecha={renderCampoFecha}
                fechaPostIni={fechaPostIni}
                fechaPostFin={fechaPostFin}
              />
            )}

            <h3 className="text-cyan-400 font-semibold mb-2 mt-4">
              Otros datos
            </h3>
            <DescripcionSection
              campos={campos}
              formData={formData}
              setFormData={setFormData}
            />

            {/* 👇 aquí vuelve tu CRUD (botones y tabla) 👇 */}
            <div className="flex gap-4 mt-2">
              <button
                onClick={handleGuardar}
                className={`${
                  editandoId
                    ? 'bg-yellow-500 hover:bg-yellow-600'
                    : 'bg-cyan-500 hover:bg-cyan-600'
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

            <table className="w-full text-sm text-left mt-6 border border-slate-600">
              <thead className="bg-slate-700">
                <tr>
                  {campos.map((campo) => (
                    <th
                      key={campo}
                      className="p-2 border border-slate-600 capitalize"
                    >
                      {campo.replace(/([A-Z])/g, ' $1')}
                    </th>
                  ))}
                  <th className="p-2 border border-slate-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {registros.length === 0 && (
                  <tr>
                    <td
                      colSpan={campos.length + 1}
                      className="p-2 text-center text-gray-400"
                    >
                      Sin registros aún.
                    </td>
                  </tr>
                )}
                {registros.map((registro) => (
                  <tr key={getId(registro)} className="border border-slate-700">
                    {campos.map((campo) => (
                     <td key={campo} className="p-2 text-white">
  {campo.toLowerCase().includes('fech') && registro[campo]
    ? parseLocalDate(registro[campo]).toLocaleDateString(
        'es-ES',
        {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }
      )
    : registro[campo]}
</td>

                    ))}
                    <td className="p-2 flex gap-2">
                      <Pencil
                        className="text-yellow-400 cursor-pointer"
                        size={16}
                        onClick={() => {
  const convertido = { ...registro };
  Object.keys(convertido).forEach((key) => {
    if (
      key.toLowerCase().includes('fech') &&
      convertido[key]
    ) {
      convertido[key] = parseLocalDate(convertido[key]); // aquí
    }
  });
  setFormData(convertido);
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
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
