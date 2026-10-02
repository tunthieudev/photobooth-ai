import { create } from "zustand";
import {
  BackgroundMode,
  BlurLevel,
  AnimatedBackgroundType,
  CustomMedia,
  BackgroundSettings,
} from "../types";
import { BLUR_OPTIONS } from "../data/presets";

interface BackgroundStoreState extends BackgroundSettings {
  isModelLoading: boolean;
  isUploading: boolean;
  hasModelLoaded: boolean;

  // Actions
  setEnabled: (enabled: boolean) => void;
  toggleEnabled: () => void;
  setMode: (mode: BackgroundMode) => void;
  setBlurLevel: (level: BlurLevel) => void;
  setColor: (color: string) => void;
  setImageId: (imageId: string) => void;
  setAnimatedId: (animatedId: AnimatedBackgroundType) => void;
  setCustomMedia: (media: CustomMedia | null) => void;
  setOpacity: (opacity: number) => void;
  setEdgeSoftness: (softness: number) => void;
  setModelLoading: (loading: boolean) => void;
  setHasModelLoaded: (loaded: boolean) => void;
  setUploading: (uploading: boolean) => void;
  reset: () => void;
}

const initialSettings: BackgroundSettings = {
  isEnabled: false,
  mode: "none",
  blurLevel: "medium",
  blurRadius: 16,
  selectedColor: "#ffffff",
  selectedImageId: "cafe",
  selectedAnimatedId: "snow",
  customMedia: null,
  opacity: 100,
  edgeSoftness: 4,
};

export const useBackgroundStore = create<BackgroundStoreState>((set) => ({
  ...initialSettings,
  isModelLoading: false,
  isUploading: false,
  hasModelLoaded: false,

  setEnabled: (enabled) =>
    set((state) => ({
      isEnabled: enabled,
      mode: enabled && state.mode === "none" ? "blur" : state.mode,
    })),

  toggleEnabled: () =>
    set((state) => {
      const next = !state.isEnabled;
      return {
        isEnabled: next,
        mode: next && state.mode === "none" ? "blur" : state.mode,
      };
    }),

  setMode: (mode) =>
    set({
      mode,
      isEnabled: mode !== "none",
    }),

  setBlurLevel: (level) => {
    const opt = BLUR_OPTIONS.find((b) => b.id === level);
    set({
      blurLevel: level,
      blurRadius: opt?.radius ?? 16,
      mode: "blur",
      isEnabled: true,
    });
  },

  setColor: (color) =>
    set({
      selectedColor: color,
      mode: "color",
      isEnabled: true,
    }),

  setImageId: (imageId) =>
    set({
      selectedImageId: imageId,
      mode: "image",
      isEnabled: true,
    }),

  setAnimatedId: (animatedId) =>
    set({
      selectedAnimatedId: animatedId,
      mode: "animated",
      isEnabled: true,
    }),

  setCustomMedia: (media) =>
    set({
      customMedia: media,
      mode: media?.type === "video" ? "video" : "image",
      isEnabled: true,
    }),

  setOpacity: (opacity) => set({ opacity }),
  setEdgeSoftness: (edgeSoftness) => set({ edgeSoftness }),
  setModelLoading: (isModelLoading) => set({ isModelLoading }),
  setHasModelLoaded: (hasModelLoaded) => set({ hasModelLoaded }),
  setUploading: (isUploading) => set({ isUploading }),

  reset: () =>
    set({
      ...initialSettings,
      isEnabled: false,
      mode: "none",
    }),
}));
