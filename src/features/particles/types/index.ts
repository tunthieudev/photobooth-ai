import { TrackedFace } from "@/features/face-tracking/types";

export type ParticleType =
  | "heart"
  | "sparkle"
  | "star"
  | "snow"
  | "flower"
  | "fire"
  | "confetti"
  | "bubble"
  | "butterfly";

export interface Particle {
  id: number;
  type: ParticleType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ax: number;
  ay: number;
  rotation: number;
  vRot: number;
  size: number;
  scale: number;
  opacity: number;
  color: string;
  secondaryColor?: string;
  age: number; // in milliseconds
  maxLife: number; // in milliseconds
  customData?: {
    wobblePhase?: number;
    wobbleSpeed?: number;
    flipPhase?: number;
    aspectRatio?: number;
    shapeVariation?: number;
  };
}

export type ParticleDensity = "low" | "medium" | "high";

export interface ParticlePresetItem {
  id: ParticleType;
  name: string;
  nameVi: string;
  icon: string;
  description: string;
  descriptionVi: string;
  triggerHint: string;
  triggerHintVi: string;
  defaultColor: string;
}

export interface ParticleSystemContext {
  canvasWidth: number;
  canvasHeight: number;
  isMirrored: boolean;
  timeMs: number;
  deltaMs: number;
  trackedFaces: TrackedFace[];
}
