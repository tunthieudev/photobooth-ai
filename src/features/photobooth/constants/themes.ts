export interface ThemeColor {
  id: string;
  name: string;
  hex: string;
  textColor: string;
}

export interface ThemeGradient {
  id: string;
  name: string;
  from: string;
  to: string;
  textColor: string;
}

export const FRAME_COLORS: ThemeColor[] = [
  { id: "white", name: "Pure White", hex: "#FFFFFF", textColor: "#0F172A" },
  { id: "noir", name: "Studio Noir", hex: "#0F172A", textColor: "#FFFFFF" },
  { id: "pastel-pink", name: "Pastel Pink", hex: "#FFE4E6", textColor: "#9F1239" },
  { id: "butter-yellow", name: "Butter Yellow", hex: "#FEF9C3", textColor: "#854D0E" },
  { id: "baby-blue", name: "Baby Blue", hex: "#E0F2FE", textColor: "#0369A1" },
  { id: "lavender", name: "Lavender", hex: "#F3E8FF", textColor: "#6B21A8" },
  { id: "matcha", name: "Matcha Green", hex: "#DCFCE7", textColor: "#166534" },
  { id: "peach", name: "Peach Cream", hex: "#FFEDD5", textColor: "#9A3412" },
  { id: "vintage-film", name: "Vintage Cream", hex: "#F5EBE0", textColor: "#4A3E3D" },
  { id: "cyber-neon", name: "Neon Dark", hex: "#18181B", textColor: "#00F0FF" },
];

export const FRAME_GRADIENTS: ThemeGradient[] = [
  { id: "sunset-glow", name: "Sunset Glow", from: "#FF9A8B", to: "#FF6A88", textColor: "#FFFFFF" },
  { id: "cyber-purple", name: "Cyber Purple", from: "#7928CA", to: "#FF0080", textColor: "#FFFFFF" },
  { id: "ocean-breeze", name: "Ocean Breeze", from: "#4FACFE", to: "#00F2FE", textColor: "#FFFFFF" },
  { id: "sweet-candy", name: "Sweet Candy", from: "#FEE140", to: "#FA709A", textColor: "#FFFFFF" },
  { id: "aurora", name: "Aurora Green", from: "#43E97B", to: "#38F9D7", textColor: "#064E3B" },
  { id: "metallic", name: "Silver Metal", from: "#E2E8F0", to: "#94A3B8", textColor: "#0F172A" },
];

export const FONT_OPTIONS = [
  { id: "Inter", name: "Modern Sans", className: "font-sans" },
  { id: "Courier Prime, monospace", name: "Vintage Typewriter", className: "font-mono" },
  { id: "Georgia, serif", name: "Editorial Serif", className: "font-serif" },
  { id: "'Comic Sans MS', cursive, sans-serif", name: "Playful Handwriting", className: "font-sans" },
];

export const CAPTION_PRESETS = [
  "PHOTO BOOTH ✦ STUDIO",
  "BESTIES FOREVER ♡",
  "SWEET MEMORIES ✨",
  "KOREAN 4-CUT STUDIO",
  "NO THOUGHTS, JUST VIBES",
  "LIVING IN 4K 📸",
  "YOU & ME FOREVER",
  "PARTY ALL NIGHT 🎉",
];
