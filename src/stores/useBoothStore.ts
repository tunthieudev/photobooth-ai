import { create } from "zustand";
import { IBoothLayout, ITemplate, IEffect } from "@/types";
import { DEFAULT_LAYOUTS } from "@/features/photobooth/constants/layouts";
import { IFilterPreset } from "@/features/filters/types";

export interface CapturedShot {
  id: string;
  dataUrl: string;
  timestamp: number;
}

export interface FrameSettings {
  backgroundType: "color" | "gradient" | "pattern";
  backgroundColor: string;
  gradientFrom: string;
  gradientTo: string;
  gradientDirection: "to-b" | "to-r" | "to-br" | "to-tr";
  padding: number;
  gap: number;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  footerText: string;
  footerSubtext: string;
  fontFamily: string;
  textColor: string;
  showDate: boolean;
  dateFormat: "YYYY.MM.DD" | "DD/MM/YYYY" | "MMM DD, YYYY" | "CUSTOM";
}

export type BoothStep = "layout" | "camera" | "select" | "customize" | "result";

interface BoothState {
  currentStep: BoothStep;
  selectedLayout: IBoothLayout;
  selectedTemplate: ITemplate | null;
  activeFilter: IFilterPreset | null;
  filterIntensity: number; // 0 - 100
  activeEffect: IEffect | null;
  capturedShots: CapturedShot[];
  slotAssignments: Record<string, string>; // slotId -> shotId or dataUrl
  frameSettings: FrameSettings;
  finalResultUrl: string | null;
  isGeneratingResult: boolean;

  // Actions
  setCurrentStep: (step: BoothStep) => void;
  setSelectedLayout: (layout: IBoothLayout) => void;
  setSelectedTemplate: (template: ITemplate | null) => void;
  setActiveFilter: (filter: IFilterPreset | null) => void;
  setFilterIntensity: (val: number) => void;
  setActiveEffect: (effect: IEffect | null) => void;
  addCapturedShot: (shot: CapturedShot) => void;
  setCapturedShots: (shots: CapturedShot[]) => void;
  assignShotToSlot: (slotId: string, shotDataUrl: string) => void;
  clearSlotAssignment: (slotId: string) => void;
  autoAssignShots: () => void;
  updateFrameSettings: (settings: Partial<FrameSettings>) => void;
  setFinalResultUrl: (url: string | null) => void;
  setIsGeneratingResult: (is: boolean) => void;
  resetBooth: () => void;
}

export const DEFAULT_FRAME_SETTINGS: FrameSettings = {
  backgroundType: "color",
  backgroundColor: "#FFFFFF",
  gradientFrom: "#FF9A8B",
  gradientTo: "#FF6A88",
  gradientDirection: "to-b",
  padding: 24,
  gap: 16,
  borderRadius: 8,
  borderWidth: 0,
  borderColor: "#E2E8F0",
  footerText: "PHOTO BOOTH ✦ STUDIO",
  footerSubtext: "MEMORIES IN 4K",
  fontFamily: "Inter",
  textColor: "#0F172A",
  showDate: true,
  dateFormat: "YYYY.MM.DD",
};

export const useBoothStore = create<BoothState>((set, get) => ({
  currentStep: "layout",
  selectedLayout: DEFAULT_LAYOUTS[0],
  selectedTemplate: null,
  activeFilter: null,
  filterIntensity: 80,
  activeEffect: null,
  capturedShots: [],
  slotAssignments: {},
  frameSettings: DEFAULT_FRAME_SETTINGS,
  finalResultUrl: null,
  isGeneratingResult: false,

  setCurrentStep: (currentStep) => set({ currentStep }),
  setSelectedLayout: (selectedLayout) => {
    set({
      selectedLayout,
      frameSettings: {
        ...get().frameSettings,
        padding: selectedLayout.padding ?? 24,
        gap: selectedLayout.gap ?? 16,
        backgroundColor: selectedLayout.background || "#FFFFFF",
        footerText: selectedLayout.footerText || "PHOTO BOOTH ✦ STUDIO",
      },
    });
    get().autoAssignShots();
  },
  setSelectedTemplate: (selectedTemplate) =>
    set({
      selectedTemplate,
      selectedLayout: selectedTemplate ? selectedTemplate.layout : DEFAULT_LAYOUTS[0],
    }),
  setActiveFilter: (activeFilter) => set({ activeFilter }),
  setFilterIntensity: (filterIntensity) => set({ filterIntensity }),
  setActiveEffect: (activeEffect) => set({ activeEffect }),
  addCapturedShot: (shot) =>
    set((state) => {
      const newShots = [...state.capturedShots, shot];
      return { capturedShots: newShots };
    }),
  setCapturedShots: (capturedShots) => {
    set({ capturedShots });
    get().autoAssignShots();
  },
  assignShotToSlot: (slotId, shotDataUrl) =>
    set((state) => ({
      slotAssignments: { ...state.slotAssignments, [slotId]: shotDataUrl },
    })),
  clearSlotAssignment: (slotId) =>
    set((state) => {
      const updated = { ...state.slotAssignments };
      delete updated[slotId];
      return { slotAssignments: updated };
    }),
  autoAssignShots: () => {
    const { capturedShots, selectedLayout } = get();
    const assignments: Record<string, string> = {};
    selectedLayout.slots.forEach((slot, idx) => {
      if (capturedShots[idx]) {
        assignments[slot.id] = capturedShots[idx].dataUrl;
      }
    });
    set({ slotAssignments: assignments });
  },
  updateFrameSettings: (newSettings) =>
    set((state) => ({
      frameSettings: { ...state.frameSettings, ...newSettings },
    })),
  setFinalResultUrl: (finalResultUrl) => set({ finalResultUrl }),
  setIsGeneratingResult: (isGeneratingResult) => set({ isGeneratingResult }),
  resetBooth: () =>
    set({
      currentStep: "layout",
      capturedShots: [],
      slotAssignments: {},
      finalResultUrl: null,
      activeEffect: null,
      frameSettings: DEFAULT_FRAME_SETTINGS,
    }),
}));
