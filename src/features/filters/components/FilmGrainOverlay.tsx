"use client";

import React, { useEffect, useRef } from "react";

interface FilmGrainOverlayProps {
  opacity: number;
}

export function FilmGrainOverlay({ opacity }: FilmGrainOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (opacity <= 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    // Small noise pattern texture for GPU speed
    const width = 180;
    const height = 180;
    canvas.width = width;
    canvas.height = height;

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    const renderNoise = () => {
      frame++;
      // Render every 2 frames for realistic film flutter
      if (frame % 2 === 0) {
        for (let i = 0; i < data.length; i += 4) {
          const val = Math.random() * 255;
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
          data[i + 3] = 40; // alpha
        }
        ctx.putImageData(imgData, 0, 0);
      }
      animId = requestAnimationFrame(renderNoise);
    };

    renderNoise();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [opacity]);

  if (opacity <= 0) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        opacity,
        backgroundRepeat: "repeat",
        backgroundSize: "180px 180px",
      }}
      className="absolute inset-0 w-full h-full pointer-events-none mix-blend-overlay z-20"
    />
  );
}
