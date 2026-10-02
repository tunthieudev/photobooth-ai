import { create } from "zustand";
import { EffectsState } from "../types";

export const useEffectsStore = create<EffectsState>((set) => ({
  selectedEffectId: null,
  selectedCategory: "all",
  intensity: 100,
  interactiveTriggersEnabled: true,

  setSelectedEffectId: (id) => set({ selectedEffectId: id }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setIntensity: (intensity) => set({ intensity }),
  toggleInteractiveTriggers: () =>
    set((state) => ({
      interactiveTriggersEnabled: !state.interactiveTriggersEnabled,
    })),
}));
