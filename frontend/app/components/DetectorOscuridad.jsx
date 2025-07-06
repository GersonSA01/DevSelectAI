'use client';

import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { useStream } from '../../context/StreamContext';
import { toast } from 'sonner';

export default function DetectorOscuridad({ onVisibilityChange, idEvaluacion }) {
  const videoRef = useRef(null);
  const { cameraStream, tomarCapturaPantalla } = useStream();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const failureCountRef = useRef(0);
  const alertaActivaRef = useRef(false);

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
    const context = canvas.getContext('2d', { willReadFrequently: true });

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
        console.warn('⚠️ Error detectando rostro:', err);
      }

      const isVisible = isBrightEnough && faceDetected;

      if (!isVisible) {
        failureCountRef.current += 1;
      } else {
        failureCountRef.current = 0;
      }

      if (failureCountRef.current >= 3 && !alertaActivaRef.current) {
        alertaActivaRef.current = true;

        toast.warning(
          !isBrightEnough
            ? 'Cámara muy oscura o bloqueada. Se realizará una captura.'
            : 'No se detecta tu rostro. Se realizará una captura.'
        );

        setTimeout(async () => {
          if (typeof tomarCapturaPantalla === 'function') {
            await tomarCapturaPantalla(idEvaluacion);
          }
          alertaActivaRef.current = false;
          failureCountRef.current = 0;
        }, 1000); // espera antes de capturar
      }

      onVisibilityChange(isVisible);
    }, 1500);

    return () => clearInterval(interval);
  }, [cameraStream, modelsLoaded, onVisibilityChange, tomarCapturaPantalla, idEvaluacion]);

  return <video ref={videoRef} style={{ display: 'none' }} playsInline muted />;
}
