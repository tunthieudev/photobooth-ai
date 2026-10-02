export type Id = string | any;

export type UserRole = "user" | "creator" | "admin";
export type SubscriptionPlan = "free" | "pro" | "event";

export interface IUser {
  _id?: Id;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  plan: SubscriptionPlan;
  credits: number;
  createdAt: Date;
  updatedAt: Date;
}

export type AssetType = "frame" | "sticker" | "effect" | "background" | "filter_lut" | "sound";

export interface IAsset {
  _id?: Id;
  name: string;
  type: AssetType;
  category: string;
  url: string;
  publicId: string;
  thumbnailUrl?: string;
  tags?: string[];
  isPremium: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export type LayoutSlot = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  borderRadius?: number;
};

export type LayoutType =
  | "korean-4-cut"
  | "classic-strip"
  | "grid-2x2"
  | "grid-3x2"
  | "strip-1x4"
  | "polaroid"
  | "passport"
  | "couple"
  | "friends";

export interface IBoothLayout {
  id: string;
  name: string;
  slug: LayoutType;
  aspectRatio: string;
  width: number;
  height: number;
  slots: LayoutSlot[];
  background?: string;
  padding?: number;
  gap?: number;
  borderWidth?: number;
  borderColor?: string;
  footerText?: string;
}

export interface IPhoto {
  _id?: Id;
  userId?: Id;
  eventId?: Id;
  url: string;
  publicId: string;
  thumbnailUrl: string;
  layoutSlug?: LayoutType;
  filterApplied?: string;
  tags?: string[];
  isPublic: boolean;
  viewCount: number;
  downloadCount: number;
  metadata?: {
    width: number;
    height: number;
    format: string;
    shotsCount?: number;
    stickersCount?: number;
    hasAI?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ITemplate {
  _id?: Id;
  name: string;
  slug: string;
  category: "minimal" | "korean" | "cute" | "retro" | "y2k" | "film" | "birthday" | "wedding" | "couple" | "friends" | "christmas" | "halloween" | "tet" | "trending";
  previewUrl: string;
  layout: IBoothLayout;
  frameUrl?: string;
  defaultFilter?: string;
  stickers?: Array<{
    assetId: string;
    url: string;
    x: number;
    y: number;
    scale: number;
    rotation: number;
  }>;
  background?: string;
  isPremium: boolean;
  isPublished: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFilter {
  _id?: Id;
  id?: string;
  name: string;
  slug: string;
  category: "basic" | "film" | "korean" | "vintage" | "cinematic" | "cute" | "bw";
  thumbnailUrl?: string;
  cssFilter?: string;
  webglShader?: string;
  settings: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    sepia?: number;
    warmth?: number;
    tint?: number;
    grain?: number;
    vignette?: number;
    blur?: number;
    hueRotate?: number;
  };
  isPremium: boolean;
  createdAt: Date;
}

export interface IEffect {
  _id?: Id;
  name: string;
  slug: string;
  category: "animal" | "cute" | "accessories" | "beauty" | "funny" | "seasonal";
  thumbnailUrl: string;
  tracking: "face" | "segmentation" | "particles" | "screen";
  maxFaces: number;
  assets: Array<{
    anchor: "forehead" | "leftEye" | "rightEye" | "nose" | "mouth" | "leftCheek" | "rightCheek" | "chin";
    url: string;
    offsetX: number;
    offsetY: number;
    scale: number;
    rotation: number;
    opacity: number;
  }>;
  triggers?: {
    blink?: string;
    smile?: string;
    openMouth?: string;
  };
  isPremium: boolean;
  createdAt: Date;
}

export interface IFrame {
  _id?: Id;
  name: string;
  category: string;
  url: string;
  publicId: string;
  thumbnailUrl: string;
  aspectRatio: string;
  isPremium: boolean;
  createdAt: Date;
}

export interface ISticker {
  _id?: Id;
  name: string;
  category: string;
  url: string;
  publicId: string;
  thumbnailUrl: string;
  isAnimated: boolean;
  isPremium: boolean;
  createdAt: Date;
}

export type AIJobStatus = "queued" | "processing" | "completed" | "failed";
export type AIToolType =
  | "meme_caption"
  | "prompt_enhance"
  | "concept_suggest"
  | "remove_background"
  | "replace_background"
  | "remove_object"
  | "style_transfer"
  | "upscale"
  | "beauty_enhance";

export interface IAIJob {
  _id?: Id;
  userId?: Id;
  tool: AIToolType;
  status: AIJobStatus;
  inputParams: Record<string, any>;
  resultUrl?: string;
  resultData?: Record<string, any>;
  error?: string;
  creditsCost: number;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAIGeneration {
  _id?: Id;
  userId?: Id;
  jobId: Id;
  prompt?: string;
  style?: string;
  inputImageUrl?: string;
  outputImageUrl: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface IEvent {
  _id?: Id;
  ownerId: Id;
  name: string;
  slug: string;
  logoUrl?: string;
  brandColor?: string;
  frameId?: Id;
  templateId?: Id;
  hashtag?: string;
  bannerUrl?: string;
  qrCodeUrl?: string;
  startDate: Date;
  endDate: Date;
  isKioskModeEnabled: boolean;
  photoCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreditTransaction {
  _id?: Id;
  userId: Id;
  amount: number;
  type: "purchase" | "usage" | "refund" | "bonus";
  description: string;
  referenceId?: string;
  createdAt: Date;
}
