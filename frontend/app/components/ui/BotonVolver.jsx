'use client';

export default function BotonVolver({ onBack }) {
  return (
    <button
      onClick={onBack}
      className="absolute top-4 left-4 text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center"
    >
      <svg
        className="w-4 h-4 mr-1"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Volver
    </button>
  );
}
