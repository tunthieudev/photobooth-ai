import { IBoothLayout } from "@/types";

export const APP_CONFIG = {
  name: "AI Photo Booth & Meme Studio",
  description: "Modern Photo Booth, AR Face Effects, Purikura & AI Creativity Studio",
  version: "1.0.0",
};

export const DEFAULT_LAYOUTS: IBoothLayout[] = [
  {
    id: "korean-4-cut",
    name: "Korean 4 Cut",
    slug: "korean-4-cut",
    aspectRatio: "1:2",
    width: 600,
    height: 1200,
    padding: 24,
    gap: 16,
    borderWidth: 0,
    background: "#ffffff",
    footerText: "PHOTO BOOTH ✦ STUDIO",
    slots: [
      { id: "slot-1", x: 24, y: 24, width: 552, height: 260, borderRadius: 8 },
      { id: "slot-2", x: 24, y: 300, width: 552, height: 260, borderRadius: 8 },
      { id: "slot-3", x: 24, y: 576, width: 552, height: 260, borderRadius: 8 },
      { id: "slot-4", x: 24, y: 852, width: 552, height: 260, borderRadius: 8 },
    ],
  },
  {
    id: "classic-strip",
    name: "Classic Strip (3-Cut)",
    slug: "classic-strip",
    aspectRatio: "1:3",
    width: 450,
    height: 1200,
    padding: 20,
    gap: 16,
    background: "#12131A",
    footerText: "MEMORIES ✦ 2025",
    slots: [
      { id: "slot-1", x: 20, y: 20, width: 410, height: 350, borderRadius: 4 },
      { id: "slot-2", x: 20, y: 386, width: 410, height: 350, borderRadius: 4 },
      { id: "slot-3", x: 20, y: 752, width: 410, height: 350, borderRadius: 4 },
    ],
  },
  {
    id: "grid-2x2",
    name: "2x2 Quad Grid",
    slug: "grid-2x2",
    aspectRatio: "1:1",
    width: 800,
    height: 800,
    padding: 24,
    gap: 16,
    background: "#FFE4E6",
    footerText: "BESTIES FOREVER",
    slots: [
      { id: "slot-1", x: 24, y: 24, width: 368, height: 340, borderRadius: 12 },
      { id: "slot-2", x: 408, y: 24, width: 368, height: 340, borderRadius: 12 },
      { id: "slot-3", x: 24, y: 380, width: 368, height: 340, borderRadius: 12 },
      { id: "slot-4", x: 408, y: 380, width: 368, height: 340, borderRadius: 12 },
    ],
  },
  {
    id: "polaroid",
    name: "Instant Polaroid",
    slug: "polaroid",
    aspectRatio: "4:5",
    width: 600,
    height: 750,
    padding: 30,
    background: "#FFFFFF",
    footerText: "Sweet Memories ♡",
    slots: [{ id: "slot-1", x: 30, y: 30, width: 540, height: 540, borderRadius: 4 }],
  },
];

export const FILTER_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "basic", label: "Basic" },
  { id: "korean", label: "Korean Soft" },
  { id: "film", label: "Vintage Film" },
  { id: "cute", label: "Cute Aesthetic" },
  { id: "cinematic", label: "Cinematic" },
  { id: "bw", label: "B&W" },
] as const;

export const EFFECT_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "animal", label: "Animals" },
  { id: "cute", label: "Cute" },
  { id: "accessories", label: "Glasses & Hats" },
  { id: "beauty", label: "Face Decor" },
  { id: "seasonal", label: "Seasonal" },
] as const;
