import { create } from "zustand";

export type AspectRatioType = "1:1" | "4:3" | "3:4" | "16:9" | "9:16";
export type CameraMode = "photo" | "burst" | "gif" | "boomerang" | "video";

interface CameraState {
  hasPermission: boolean | null;
  permissionError: string | null;
  selectedDeviceId: string | null;
  availableDevices: MediaDeviceInfo[];
  facingMode: "user" | "environment";
  isMirrored: boolean;
  aspectRatio: AspectRatioType;
  countdownDuration: 0 | 3 | 5 | 10;
  burstCount: 1 | 2 | 3 | 4 | 6 | 8;
  mode: CameraMode;
  isStreaming: boolean;
  isCapturing: boolean;
  isCountingDown: boolean;
  countdownCurrent: number;
  
  // Actions
  setHasPermission: (has: boolean | null) => void;
  setPermissionError: (error: string | null) => void;
  setSelectedDeviceId: (id: string | null) => void;
  setAvailableDevices: (devices: MediaDeviceInfo[]) => void;
  toggleFacingMode: () => void;
  setFacingMode: (mode: "user" | "environment") => void;
  toggleMirror: () => void;
  setAspectRatio: (ratio: AspectRatioType) => void;
  setCountdownDuration: (duration: 0 | 3 | 5 | 10) => void;
  setBurstCount: (count: 1 | 2 | 3 | 4 | 6 | 8) => void;
  setMode: (mode: CameraMode) => void;
  setIsStreaming: (is: boolean) => void;
  setIsCapturing: (is: boolean) => void;
  setIsCountingDown: (is: boolean) => void;
  setCountdownCurrent: (val: number) => void;
}

export const useCameraStore = create<CameraState>((set) => ({
  hasPermission: null,
  permissionError: null,
  selectedDeviceId: null,
  availableDevices: [],
  facingMode: "user",
  isMirrored: true,
  aspectRatio: "3:4",
  countdownDuration: 3,
  burstCount: 4,
  mode: "photo",
  isStreaming: false,
  isCapturing: false,
  isCountingDown: false,
  countdownCurrent: 3,

  setHasPermission: (hasPermission) => set({ hasPermission }),
  setPermissionError: (permissionError) => set({ permissionError }),
  setSelectedDeviceId: (selectedDeviceId) => set({ selectedDeviceId }),
  setAvailableDevices: (availableDevices) => set({ availableDevices }),
  toggleFacingMode: () =>
    set((state) => ({
      facingMode: state.facingMode === "user" ? "environment" : "user",
      isMirrored: state.facingMode === "environment", // auto-mirror when front
    })),
  setFacingMode: (facingMode) =>
    set({ facingMode, isMirrored: facingMode === "user" }),
  toggleMirror: () => set((state) => ({ isMirrored: !state.isMirrored })),
  setAspectRatio: (aspectRatio) => set({ aspectRatio }),
  setCountdownDuration: (countdownDuration) => set({ countdownDuration }),
  setBurstCount: (burstCount) => set({ burstCount }),
  setMode: (mode) => set({ mode }),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  setIsCapturing: (isCapturing) => set({ isCapturing }),
  setIsCountingDown: (isCountingDown) => set({ isCountingDown }),
  setCountdownCurrent: (countdownCurrent) => set({ countdownCurrent }),
}));
