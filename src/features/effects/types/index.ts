import { TrackedFace } from "@/features/face-tracking/types";

export type EffectCategory =
  | "all"
  | "animal"
  | "cute"
  | "accessories"
  | "beauty"
  | "funny";

export type ARAnchorPoint =
  | "headTop"
  | "forehead"
  | "eyes"
  | "nose"
  | "cheeks"
  | "mouth"
  | "chin"
  | "face";

export interface AREffectRenderContext {
  ctx: CanvasRenderingContext2D;
  face: TrackedFace;
  canvasWidth: number;
  canvasHeight: number;
  isMirrored: boolean;
  intensity: number;
  timeMs: number;
}

export interface AREffectItem {
  id: string;
  name: string;
  nameVi: string;
  category: EffectCategory;
  icon: string; // Emoji or icon identifier
  description: string;
  descriptionVi: string;
  interactiveHint?: string;
  interactiveHintVi?: string;
  render: (context: AREffectRenderContext) => void;
}

export interface EffectsState {
  selectedEffectId: string | null;
  selectedCategory: EffectCategory;
  intensity: number;
  interactiveTriggersEnabled: boolean;

  // Actions
  setSelectedEffectId: (id: string | null) => void;
  setSelectedCategory: (category: EffectCategory) => void;
  setIntensity: (val: number) => void;
  toggleInteractiveTriggers: () => void;
}
