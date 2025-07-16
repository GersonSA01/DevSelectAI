import { useState, useEffect } from 'react';

export default function InstruccionesPrevias({ token, cameraVisible, screenStream, setPresentacionIniciada }) {
  const [nombrePostulante, setNombrePostulante] = useState('');

  useEffect(() => {
    const fetchPostulante = async () => {
      if (!token || localStorage.getItem('id_postulante')) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/postulante/token/${token}`);
        const data = await res.json();

        if (data?.Id_Postulante) {
          localStorage.setItem('id_postulante', data.Id_Postulante);
          setNombrePostulante(`${data.Nombre} ${data.Apellido}`);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchPostulante();
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <div className="max-w-md">
        <h1 className="text-2xl font-bold mb-4">Antes de iniciar la entrevista</h1>

        {nombrePostulante && (
          <p className="text-cyan-400 font-semibold mb-4">Postulante: {nombrePostulante}</p>
        )}

        <ul className="list-decimal text-left text-sm text-secondaryText space-y-2 mb-6">
          <li>Quédate en el entorno de entrevista.</li>
          <li>No abandones ni cambies de pestaña.</li>
          <li>Mantén contacto visual con la pantalla.</li>
          <li>15 segundos para responder por pregunta.</li>
        </ul>

        <button
          onClick={() => setPresentacionIniciada(true)}
          disabled={!cameraVisible || !screenStream}
          className={`px-6 py-3 rounded-md w-full ${
            cameraVisible && screenStream
              ? 'bg-yellow-600 hover:bg-yellow-700'
              : 'bg-gray-500 cursor-not-allowed'
          }`}
        >
          Iniciar Entrevista
        </button>
      </div>
    </div>
  );
}
