"use client";

import React, { useRef, useEffect } from "react";
import { TrackedFace } from "@/features/face-tracking/types";
import { useEffectsStore } from "../stores/useEffectsStore";
import { getEffectById } from "../data/effects-registry";
import { renderAREffectsToCanvas } from "../renderer/ar-canvas-renderer";
import { useCameraStore } from "@/stores/useCameraStore";

interface AREffectsOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  trackedFacesRef: React.RefObject<TrackedFace[]>;
}

export const AREffectsOverlay: React.FC<AREffectsOverlayProps> = ({
  videoRef,
  trackedFacesRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { selectedEffectId, intensity } = useEffectsStore();
  const { isMirrored } = useCameraStore();

  useEffect(() => {
    let animId: number;

    const render = (timeMs: number) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (!canvas || !video) {
        animId = requestAnimationFrame(render);
        return;
      }

      // Sync canvas resolution with live video dimensions
      const width = video.videoWidth || video.clientWidth || 640;
      const height = video.videoHeight || video.clientHeight || 480;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        animId = requestAnimationFrame(render);
        return;
      }

      // Clear previous frame
      ctx.clearRect(0, 0, width, height);

      // Only render if an effect is active
      const effect = getEffectById(selectedEffectId);
      const faces = trackedFacesRef.current || [];

      if (effect && faces.length > 0) {
        renderAREffectsToCanvas({
          ctx,
          faces,
          effect,
          width,
          height,
          isMirrored,
          intensity,
          timeMs,
        });
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [videoRef, trackedFacesRef, selectedEffectId, intensity, isMirrored]);

  if (!selectedEffectId) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-20 w-full h-full object-cover"
    />
  );
};
