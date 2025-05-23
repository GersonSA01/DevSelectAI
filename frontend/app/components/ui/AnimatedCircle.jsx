'use client';

export default function AnimatedCircle({ letter, isPlaying }) {
  return (
    <div className="relative group">
      {/* Aura azul con parpadeo lento */}
      <div
        className={`absolute inset-0 w-24 h-24 rounded-full bg-[#3BDCF6] blur-xl transition-all
        ${isPlaying
          ? 'scale-110 opacity-80 shadow-[0_0_30px_#3BDCF6] animate-[pulseSlow_1.5s_ease-in-out_infinite]'
          : 'scale-100 opacity-60'}
        group-hover:scale-110 group-hover:opacity-80 group-hover:shadow-[0_0_30px_#3BDCF6]`}
      />

      {/* Círculo central */}
      <div
        className={`relative w-24 h-24 bg-[#3BDCF6] rounded-full flex items-center justify-center text-black font-bold text-xl shadow-xl
        transition-transform duration-300
        ${isPlaying ? 'scale-110 shadow-[0_0_30px_#3BDCF6]' : ''}
        group-hover:scale-110 group-hover:shadow-[0_0_30px_#3BDCF6]`}
      >
        {letter}
      </div>

      {/* Animación personalizada con @keyframes */}
      <style jsx>{`
        @keyframes pulseSlow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.1); }
        }
      `}</style>
    </div>  
  );
}
