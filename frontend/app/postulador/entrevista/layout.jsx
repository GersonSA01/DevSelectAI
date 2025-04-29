// app/postulador/entrevista/layout.jsx
'use client';
import { StreamProvider } from '../../../context/StreamContext';

export default function EntrevistaLayout({ children }) {
  return (
    <StreamProvider>
      <main
        className="min-h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/fondo_pantalla.png')" }}
      >
        {children}
      </main>
    </StreamProvider>
  );
}
