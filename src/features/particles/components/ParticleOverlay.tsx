"use client";

import React, { useRef, useEffect } from "react";
import { TrackedFace } from "@/features/face-tracking/types";
import { useParticleStore } from "../stores/useParticleStore";
import { globalParticleSystem } from "../engine/particle-system";
import { useCameraStore } from "@/stores/useCameraStore";

interface ParticleOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  trackedFacesRef: React.RefObject<TrackedFace[]>;
}

export const ParticleOverlay: React.FC<ParticleOverlayProps> = ({
  videoRef,
  trackedFacesRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { activePreset, density, expressionTriggersEnabled } = useParticleStore();
  const { isMirrored } = useCameraStore();

  useEffect(() => {
    // If neither ambient particles nor expression triggers are active, don't run loop
    if (activePreset === "none" && !expressionTriggersEnabled) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    let animId: number;

    const render = (timeMs: number) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (!canvas || !video) {
        animId = requestAnimationFrame(render);
        return;
      }

      // Sync canvas dimensions with video feed
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

      const trackedFaces = trackedFacesRef.current || [];

      // Update physics and render all alive particles
      globalParticleSystem.updateAndRender(
        ctx,
        {
          canvasWidth: width,
          canvasHeight: height,
          isMirrored,
          timeMs,
          deltaMs: 16.666,
          trackedFaces,
        },
        activePreset,
        density,
        expressionTriggersEnabled
      );

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [videoRef, trackedFacesRef, activePreset, density, expressionTriggersEnabled, isMirrored]);

  if (activePreset === "none" && !expressionTriggersEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-20 w-full h-full object-cover"
    />
  );
};
