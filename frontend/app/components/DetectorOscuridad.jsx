'use client';

import { useEffect, useRef, useState } from 'react';
import { useStream } from '../../context/StreamContext';
import { Alert } from '../components/alerts/Alerts';

export default function DetectorOscuridad({ onVisibilityChange }) {
  const videoRef = useRef(null);
  const { cameraStream } = useStream();
  const [alertShown, setAlertShown] = useState(false);

  useEffect(() => {
    if (!cameraStream || !videoRef.current) return;

    videoRef.current.srcObject = cameraStream;
    videoRef.current.play();

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const interval = setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.readyState !== 4) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const frame = context.getImageData(0, 0, canvas.width, canvas.height);
      const length = frame.data.length;
      let totalBrightness = 0;

      for (let i = 0; i < length; i += 4) {
        const r = frame.data[i];
        const g = frame.data[i + 1];
        const b = frame.data[i + 2];
        const brightness = (r + g + b) / 3;
        totalBrightness += brightness;
      }

      const avgBrightness = totalBrightness / (length / 4);
      const isVisible = avgBrightness >= 30;

      onVisibilityChange(isVisible); // Informar al padre

      if (!isVisible && !alertShown) {
        setAlertShown(true);
        await Alert({
          title: 'Advertencia',
          text: 'Tu cámara está muy oscura o bloqueada. Asegúrate de tener buena iluminación.',
          icon: 'warning',
          confirmButtonText: 'Entendido',
          showCancelButton: false,
        });
        setTimeout(() => setAlertShown(false), 5000);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cameraStream, alertShown, onVisibilityChange]);

  return (
    <video ref={videoRef} style={{ display: 'none' }} playsInline muted />
  );
}
