'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b1120] text-white px-4">
      <div className="text-center">
        <Image
          src="/cat-404.png"
          alt="404 Cat"
          width={400}
          height={400}
          className="mx-auto"
        />
        <h1 className="text-5xl font-bold text-white">404</h1>
        <p className="text-lg mt-2 text-sky-400">Ooops… página no encontrada</p>
        <Link
          href="/"
          className="mt-6 inline-block px-6 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
