'use client';
import { FileText, Code2, HelpCircle, MessageSquareText } from 'lucide-react';

export default function PreguntasEvaluacion({ preguntasTeoricas, preguntaTecnica }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Preguntas Teóricas */}
      <div className="bg-[#1D1E33] p-6 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="text-[#3BDCF6]" />
          <h3 className="text-base font-semibold text-white">Preguntas Teóricas</h3>
        </div>

        {preguntasTeoricas.length === 0 ? (
          <p className="text-gray-400 text-sm">No respondidas.</p>
        ) : (
          preguntasTeoricas.map((p, i) => (
            <div key={i} className="mb-4 space-y-1">
              <div className="flex items-start gap-2">
                <HelpCircle size={16} className="text-gray-400 mt-0.5" />
                <p className="text-sm font-medium text-white leading-tight">{p.pregunta}</p>
              </div>
              <div className="flex items-start gap-2 pl-6">
                <MessageSquareText size={14} className="text-gray-400 mt-0.5" />
                <p className="text-sm text-gray-300 leading-tight">Respuesta: {p.respuesta}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pregunta Técnica */}
      {/* Pregunta Técnica */}
<div className="bg-[#1D1E33] p-6 rounded-lg">
  <div className="flex items-center gap-2 mb-4">
    <Code2 className="text-[#3BDCF6]" size={20} />
    <h3 className="text-base font-semibold text-white">Pregunta Técnica</h3>
  </div>

  {preguntaTecnica ? (
    <div>
      <div className="flex items-start gap-2">
  <p className="text-base font-medium text-white leading-snug">
    {preguntaTecnica.pregunta}
  </p>
</div>
<div className="flex items-start gap-2 mt-3">
  <pre className="font-mono text-[14px] text-gray-300 bg-[#111] p-3 rounded w-full overflow-x-auto whitespace-pre-wrap leading-normal">
    {preguntaTecnica.respuesta}
  </pre>
</div>

    </div>
  ) : (
    <p className="text-gray-400 text-sm">No respondida.</p>
  )}
</div>

    </div>
  );
}
