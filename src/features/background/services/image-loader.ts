import { PRESET_IMAGES } from "../data/presets";

const imageCache = new Map<string, HTMLImageElement>();

/**
 * Preloads and caches an image element with crossOrigin='anonymous'
 */
export function preloadImage(url: string): Promise<HTMLImageElement> {
  if (imageCache.has(url)) {
    const cached = imageCache.get(url)!;
    if (cached.complete) return Promise.resolve(cached);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageCache.set(url, img);
      resolve(img);
    };
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

/**
 * Returns cached image if available immediately, or null
 */
export function getCachedImage(url: string): HTMLImageElement | null {
  const img = imageCache.get(url);
  return img && img.complete ? img : null;
}

/**
 * Preload all default preset background images in background
 */
export function preloadAllPresetImages() {
  if (typeof window === "undefined") return;
  PRESET_IMAGES.forEach((preset) => {
    if (preset.imageUrl) {
      preloadImage(preset.imageUrl).catch(() => {
        // Silently ignore preloading errors
      });
    }
  });
}
