"use client";

import React from "react";
import { FilmGrainOverlay } from "./FilmGrainOverlay";

interface FilterOverlayLayerProps {
  grainOpacity?: number;
  vignetteOpacity?: number;
  showLightLeak?: boolean;
}

export function FilterOverlayLayer({
  grainOpacity = 0,
  vignetteOpacity = 0,
  showLightLeak = false,
}: FilterOverlayLayerProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-20">
      {/* 1. Film Grain Canvas */}
      {grainOpacity > 0 && <FilmGrainOverlay opacity={grainOpacity} />}

      {/* 2. Vignette Radial Gradient */}
      {vignetteOpacity > 0 && (
        <div
          style={{
            opacity: vignetteOpacity,
            background:
              "radial-gradient(circle at center, transparent 40%, rgba(0, 0, 0, 0.85) 100%)",
          }}
          className="absolute inset-0 w-full h-full mix-blend-multiply"
        />
      )}

      {/* 3. Optical Light Leak Texture */}
      {showLightLeak && (
        <div
          style={{
            background:
              "radial-gradient(ellipse at top left, rgba(255, 120, 50, 0.45) 0%, rgba(255, 50, 100, 0.25) 45%, transparent 70%), radial-gradient(ellipse at bottom right, rgba(255, 200, 50, 0.3) 0%, transparent 60%)",
          }}
          className="absolute inset-0 w-full h-full mix-blend-screen animate-pulse-slow"
        />
      )}
    </div>
  );
}
