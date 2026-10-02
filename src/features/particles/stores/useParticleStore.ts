import { create } from "zustand";
import { ParticleType, ParticleDensity } from "../types";
import { globalParticleSystem } from "../engine/particle-system";

interface ParticleState {
  activePreset: ParticleType | "none";
  expressionTriggersEnabled: boolean;
  density: ParticleDensity;

  // Actions
  setActivePreset: (preset: ParticleType | "none") => void;
  toggleExpressionTriggers: () => void;
  setDensity: (density: ParticleDensity) => void;
  resetParticles: () => void;
}

export const useParticleStore = create<ParticleState>((set) => ({
  activePreset: "none",
  expressionTriggersEnabled: true,
  density: "medium",

  setActivePreset: (activePreset) => {
    if (activePreset === "none") {
      globalParticleSystem.reset();
    }
    set({ activePreset });
  },
  toggleExpressionTriggers: () =>
    set((state) => ({
      expressionTriggersEnabled: !state.expressionTriggersEnabled,
    })),
  setDensity: (density) => set({ density }),
  resetParticles: () => {
    globalParticleSystem.reset();
    set({ activePreset: "none" });
  },
}));
