import { TrackedFace } from "@/features/face-tracking/types";
import { AREffectItem } from "../types";

interface RenderAREffectsOptions {
  ctx: CanvasRenderingContext2D;
  faces: TrackedFace[];
  effect: AREffectItem | undefined;
  width: number;
  height: number;
  isMirrored: boolean;
  intensity?: number;
  timeMs?: number;
}

/**
 * High performance engine that renders AR Face Effects onto any HTML5 Canvas
 * Automatically scales, rotates, and applies effects to all detected faces in the frame.
 */
export function renderAREffectsToCanvas({
  ctx,
  faces,
  effect,
  width,
  height,
  isMirrored,
  intensity = 100,
  timeMs = performance.now(),
}: RenderAREffectsOptions): void {
  if (!effect || !faces || faces.length === 0 || intensity <= 0) {
    return;
  }

  ctx.save();

  // Apply global effect opacity/intensity
  if (intensity < 100) {
    ctx.globalAlpha = intensity / 100;
  }

  // Iterate over each detected face (supports multiple faces simultaneously)
  for (let i = 0; i < faces.length; i++) {
    const face = faces[i];
    try {
      effect.render({
        ctx,
        face,
        canvasWidth: width,
        canvasHeight: height,
        isMirrored,
        intensity,
        timeMs,
      });
    } catch (err) {
      console.debug("AR effect rendering error on face:", err);
    }
  }

  ctx.restore();
}
