import TablaGeneral from '../../components/TablaGeneral';
import { renderFilasPostulantes } from './utils';

export default function PostulacionesTabla({
  postulantes,
  filtroNombre,
  itinerario,
  programacionActual,
  programacionSeleccionada,
  router,
  setPostulantes
}) {
  const filas = renderFilasPostulantes({
    postulantes,
    filtroNombre,
    itinerario,
    programacionActual,
    programacionSeleccionada,
    router,
    setPostulantes
  });

  return (
    <div className="overflow-x-auto rounded-xl bg-slate-900 border border-slate-800 shadow">
      <TablaGeneral
        columnas={['Fecha', 'Nombre', 'Vacante', 'Habilidades', 'Estado / Calificación', 'Acciones']}
        filas={filas}
      />
    </div>
  );
}
