'use client';

import { HiOutlineMicrophone, HiOutlineDocumentText, HiOutlineCode } from 'react-icons/hi';
import { FiCamera } from 'react-icons/fi';

export default function ResumenFinal({ puntajeFinal, observacion, calificaciones }) {
  return (
    <div className="space-y-6">
      
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-[#1D1E33] p-4 rounded-lg  ">
          <p className="text-sm text-gray-400 font-semibold mb-3">Calificación por módulo</p>
          <ul className="text-sm text-white space-y-2">
            <li className="flex items-center gap-2">
              <HiOutlineMicrophone className="text-xl text-[#3BDCF6]" />
              Entrevista Oral: <span className="font-bold ml-auto">{calificaciones.entrevista}</span>
            </li>
            <li className="flex items-center gap-2">
              <HiOutlineDocumentText className="text-xl text-[#3BDCF6]" />
              Teórico: <span className="font-bold ml-auto">{calificaciones.teorico}</span>
            </li>
            <li className="flex items-center gap-2">
              <HiOutlineCode className="text-xl text-[#3BDCF6]" />
              Técnico: <span className="font-bold ml-auto">{calificaciones.tecnica}</span>
            </li>
            <li className="flex items-center gap-2">
              <FiCamera className="text-xl text-[#3BDCF6]" />
              Capturas: <span className="font-bold ml-auto">{calificaciones.capturas}</span>
            </li>
          </ul>
        </div>

        
        <div className="bg-[#1D1E33] p-6 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-gray-300 mb-1">Puntaje Final</p>
<p className="text-3xl md:text-5xl font-bold text-[#3BDCF6]">{puntajeFinal} / 20</p>
          </div>
        </div>
      </div>

      
      <div className="bg-[#1D1E33] p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Observaciones del Reclutador</h2>
        <p className="text-sm text-gray-300">
          {observacion || 'Sin observaciones registradas.'}
        </p>
      </div>
    </div>
  );
}
