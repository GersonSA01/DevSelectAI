'use client';

import { Mic } from 'lucide-react';

export default function AnimatedCircle({ letter, isPlaying, isRecording, onStop }) {
  return (
    <div className="relative group flex flex-col items-center">
      {/* Aura animada */}
      <div
        className={`absolute inset-0 w-24 h-24 rounded-full blur-xl transition-all
        ${isPlaying
          ? 'bg-[#3BDCF6] scale-110 opacity-80 shadow-[0_0_30px_#3BDCF6] animate-[pulseSlow_1.5s_ease-in-out_infinite]'
          : 'bg-[#3BDCF6] scale-100 opacity-60'}
        group-hover:scale-110 group-hover:opacity-80 group-hover:shadow-[0_0_30px_#3BDCF6]`}
      />

      {/* Botón central */}
      <button
        onClick={() => isRecording && onStop?.()}
        className={`relative w-24 h-24 rounded-full flex items-center justify-center text-black font-bold text-xl shadow-xl
          transition-transform duration-300 focus:outline-none
          ${isPlaying ? 'bg-[#3BDCF6] scale-110 shadow-[0_0_30px_#3BDCF6]' : 'bg-[#3BDCF6]'}
          group-hover:scale-110 group-hover:shadow-[0_0_30px_#3BDCF6]'`}
        title={isRecording ? 'Detener grabación' : ''}
      >
        {isRecording ? (
          <Mic className="w-8 h-8 text-white animate-pulse" />
        ) : (
          letter
        )}
      </button>

      {isRecording && (
        <span className="mt-2 text-red-300 font-semibold animate-pulse">Grabando... (clic para detener)</span>
      )}

      <style jsx>{`
        @keyframes pulseSlow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
