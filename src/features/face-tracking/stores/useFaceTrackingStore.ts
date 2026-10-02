import { create } from "zustand";
import { FaceTrackingStatus } from "../types";

interface FaceTrackingState {
  isTrackingEnabled: boolean;
  isDebugMode: boolean;
  status: FaceTrackingStatus;
  errorMessage: string | null;
  maxFaces: number;
  detectedFacesCount: number;
  fps: number;

  // Actions
  setTrackingEnabled: (enabled: boolean) => void;
  toggleTracking: () => void;
  setIsDebugMode: (debug: boolean) => void;
  toggleDebugMode: () => void;
  setStatus: (status: FaceTrackingStatus) => void;
  setErrorMessage: (msg: string | null) => void;
  setMaxFaces: (count: number) => void;
  setStats: (count: number, fps: number) => void;
}

export const useFaceTrackingStore = create<FaceTrackingState>((set) => ({
  isTrackingEnabled: true,
  isDebugMode: false,
  status: "uninitialized",
  errorMessage: null,
  maxFaces: 4,
  detectedFacesCount: 0,
  fps: 0,

  setTrackingEnabled: (enabled) =>
    set({ isTrackingEnabled: enabled, status: enabled ? "loading" : "disabled" }),
  toggleTracking: () =>
    set((state) => ({
      isTrackingEnabled: !state.isTrackingEnabled,
      status: !state.isTrackingEnabled ? "loading" : "disabled",
    })),
  setIsDebugMode: (debug) => set({ isDebugMode: debug }),
  toggleDebugMode: () => set((state) => ({ isDebugMode: !state.isDebugMode })),
  setStatus: (status) => set({ status }),
  setErrorMessage: (errorMessage) => set({ errorMessage, status: "error" }),
  setMaxFaces: (maxFaces) => set({ maxFaces }),
  setStats: (detectedFacesCount, fps) => set({ detectedFacesCount, fps }),
}));
