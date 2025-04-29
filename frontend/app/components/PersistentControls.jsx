'use client';
import { useStream } from '../context/StreamContext';

export default function PersistentControls() {
  const { setScreenStream } = useStream();

  const shareScreen = async () => {
    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
      setScreenStream(screen);
    } catch (e) {
      console.error('Error al compartir pantalla:', e);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button onClick={shareScreen} className="px-4 py-2 bg-purple-600 text-white rounded-md">
        Compartir Pantalla
      </button>
    </div>
  );
}