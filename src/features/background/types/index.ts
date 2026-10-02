export type BackgroundMode = "none" | "blur" | "color" | "image" | "video" | "animated";

export type BlurLevel = "light" | "medium" | "strong" | "bokeh";

export interface BlurOption {
  id: BlurLevel;
  label: string;
  radius: number; // in pixels
  description: string;
}

export interface ColorPreset {
  id: string;
  name: string;
  value: string;
  isGradient?: boolean;
}

export interface PresetImage {
  id: string;
  name: string;
  category: "indoor" | "nature" | "scifi" | "holiday" | "aesthetic";
  description: string;
  thumbnailGradient: string;
  ambientLight: string;
  accentColor: string;
  svgScene?: string; // High-res SVG procedural background or image URL
  imageUrl?: string;
}

export type AnimatedBackgroundType =
  | "snow"
  | "rain"
  | "cloud"
  | "neon"
  | "heart"
  | "cherry_blossom";

export interface AnimatedBackgroundPreset {
  id: AnimatedBackgroundType;
  name: string;
  description: string;
  icon: string;
  themeColor: string;
}

export interface CustomMedia {
  url: string;
  type: "image" | "video";
  name: string;
  size?: number;
  publicId?: string;
}

export interface BackgroundSettings {
  mode: BackgroundMode;
  blurLevel: BlurLevel;
  blurRadius: number;
  selectedColor: string;
  selectedImageId: string;
  selectedAnimatedId: AnimatedBackgroundType;
  customMedia: CustomMedia | null;
  opacity: number; // 0 - 100%
  edgeSoftness: number; // 0 - 20px
  isEnabled: boolean;
}
