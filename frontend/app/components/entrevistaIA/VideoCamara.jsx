import { useEffect, useRef } from 'react';
import { useStream } from '../../../context/StreamContext';

export default function VideoCamara() {
  const { cameraStream, reiniciarCamara } = useStream();
  const camRef = useRef(null);

  useEffect(() => {
    if (!cameraStream) {
      reiniciarCamara();
      return;
    }

    if (camRef.current) {
      camRef.current.srcObject = cameraStream;
      camRef.current.play();
    }

    return () => {
      if (camRef.current) {
        camRef.current.pause();
        camRef.current.srcObject = null;
      }
    };
  }, [cameraStream]);

  return (
    <video
      ref={camRef}
      muted
      className="absolute bottom-24 left-4 w-32 md:w-[320px] aspect-video bg-black rounded-lg object-cover z-50"
    />
  );
}
