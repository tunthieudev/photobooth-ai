export type FilterCategory =
  | "all"
  | "korean"
  | "film"
  | "basic"
  | "vintage"
  | "cinematic"
  | "cute"
  | "bw";

export interface FilterSettings {
  brightness?: number; // default 100%
  contrast?: number; // default 100%
  saturate?: number; // default 100%
  sepia?: number; // default 0%
  hueRotate?: number; // default 0deg
  blur?: number; // default 0px
  warmth?: number; // 0 - 100 (simulated via sepia + hue)
  fade?: number; // 0 - 100
  grain?: number; // 0 - 100% opacity of film grain
  vignette?: number; // 0 - 100% opacity of vignette
  lightLeak?: boolean;
  dust?: boolean;
}

export interface IFilterPreset {
  id: string;
  name: string;
  category: FilterCategory;
  description: string;
  cssFilter: string; // Base CSS filter string at 100% intensity
  settings: FilterSettings;
  previewGradient: string; // swatch preview background
  isPremium?: boolean;
}
