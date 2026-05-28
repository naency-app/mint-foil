"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseCameraOptions {
  facingMode?: "user" | "environment";
}

export type CameraError = {
  message: string;
  type: "no-https" | "no-api" | "denied" | "unavailable" | "unknown";
};

export function useCamera({
  facingMode = "environment",
}: UseCameraOptions = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<CameraError | null>(null);

  const start = useCallback(async (): Promise<boolean> => {
    setError(null);

    if (typeof window !== "undefined" && !window.isSecureContext) {
      setError({
        message:
          "A câmera requer uma conexão segura (HTTPS). Acesse pelo HTTPS ou localhost.",
        type: "no-https",
      });
      return false;
    }

    if (
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== "function"
    ) {
      setError({
        message:
          "Seu navegador não suporta acesso à câmera. Tente Chrome, Safari ou Firefox.",
        type: "no-api",
      });
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      setIsActive(true);
      return true;
    } catch (err) {
      let cameraError: CameraError;

      if (err instanceof DOMException) {
        switch (err.name) {
          case "NotAllowedError":
            cameraError = {
              message:
                "Permissão da câmera negada. Vá em Configurações > App/Site > Permitir Câmera.",
              type: "denied",
            };
            break;
          case "NotFoundError":
            cameraError = {
              message: "Nenhuma câmera encontrada neste dispositivo.",
              type: "unavailable",
            };
            break;
          case "NotReadableError":
            cameraError = {
              message:
                "A câmera está sendo usada por outro app. Feche outros apps e tente novamente.",
              type: "unavailable",
            };
            break;
          case "OverconstrainedError":
            cameraError = {
              message:
                "Câmera traseira não disponível. Tentando câmera frontal...",
              type: "unavailable",
            };
            break;
          default:
            cameraError = {
              message: `Erro ao acessar câmera: ${err.name} — ${err.message}`,
              type: "unknown",
            };
        }
      } else {
        cameraError = {
          message: "Erro inesperado ao acessar a câmera.",
          type: "unknown",
        };
      }

      setError(cameraError);
      return false;
    }
  }, [facingMode]);

  const stop = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  const capture = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.9);
  }, []);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  const setVideoRef = useCallback((el: HTMLVideoElement | null) => {
    (videoRef as { current: HTMLVideoElement | null }).current = el;
    if (el && streamRef.current) {
      el.srcObject = streamRef.current;
      el.play().catch(() => {});
    }
  }, []);

  return {
    videoRef: setVideoRef,
    canvasRef,
    isActive,
    error,
    start,
    stop,
    capture,
  };
}
