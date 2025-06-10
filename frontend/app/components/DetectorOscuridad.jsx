'use client';

import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { useStream } from '../../context/StreamContext';
import { Alert } from '../components/alerts/Alerts';

export default function DetectorOscuridad({ onVisibilityChange }) {
  const videoRef = useRef(null);
  const { cameraStream } = useStream();
  const [alertShown, setAlertShown] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const failureCountRef = useRef(0);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        setModelsLoaded(true);
      } catch (error) {
        console.error('❌ Error cargando modelos de face-api:', error);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (!cameraStream || !videoRef.current || !modelsLoaded) return;

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
        totalBrightness += (frame.data[i] + frame.data[i + 1] + frame.data[i + 2]) / 3;
      }

      const avgBrightness = totalBrightness / (length / 4);
      const isBrightEnough = avgBrightness >= 25;

      let faceDetected = false;
      try {
        const detections = await faceapi.detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.2 })
        );
        faceDetected = detections.length > 0;
      } catch (err) {
        console.warn("⚠️ Error detectando rostro:", err);
      }

      const isVisible = isBrightEnough && faceDetected;

      if (!isVisible) {
        failureCountRef.current += 1;
      } else {
        failureCountRef.current = 0;
      }

      if (failureCountRef.current >= 3 && !alertShown) {
        // ⚠️ Captura imagen antes de mostrar alerta
        const blob = await new Promise((resolve) => {
          canvas.toBlob((b) => resolve(b), 'image/jpeg');
        });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `capture/captura_${Date.now()}.jpg`; // navegador debe permitir carpetas
        link.click();

        setAlertShown(true);
        await Alert({
          title: 'Advertencia',
          text: !isBrightEnough
            ? 'Tu cámara está muy oscura o bloqueada.'
            : 'No se detecta tu rostro. Asegúrate de estar frente a la cámara.',
          icon: 'warning',
          confirmButtonText: 'Entendido',
        });
        setTimeout(() => {
          setAlertShown(false);
          failureCountRef.current = 0;
        }, 4000);
      }

      onVisibilityChange(isVisible);
    }, 1500);

    return () => clearInterval(interval);
  }, [cameraStream, modelsLoaded, alertShown, onVisibilityChange]);

  return (
    <video ref={videoRef} style={{ display: 'none' }} playsInline muted />
  );
}
