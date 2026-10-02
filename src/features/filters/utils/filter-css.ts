import { IFilterPreset } from "../types";

export function getComputedFilterCSS(
  filter: IFilterPreset | null,
  intensity: number = 80
): string {
  if (!filter || filter.id === "normal" || intensity === 0) {
    return "none";
  }

  const factor = intensity / 100;
  const s = filter.settings;

  const parts: string[] = [];

  // Brightness: base is 1 (100%)
  if (s.brightness !== undefined) {
    const val = 1 + ((s.brightness - 100) / 100) * factor;
    parts.push(`brightness(${val.toFixed(3)})`);
  }

  // Contrast: base is 1 (100%)
  if (s.contrast !== undefined) {
    const val = 1 + ((s.contrast - 100) / 100) * factor;
    parts.push(`contrast(${val.toFixed(3)})`);
  }

  // Saturation: base is 1 (100%)
  if (s.saturate !== undefined) {
    const val = 1 + ((s.saturate - 100) / 100) * factor;
    parts.push(`saturate(${Math.max(0, val).toFixed(3)})`);
  }

  // Sepia: base is 0
  if (s.sepia !== undefined && s.sepia > 0) {
    const val = (s.sepia / 100) * factor;
    parts.push(`sepia(${val.toFixed(3)})`);
  }

  // Hue Rotate: base is 0deg
  if (s.hueRotate !== undefined && s.hueRotate !== 0) {
    const val = s.hueRotate * factor;
    parts.push(`hue-rotate(${val.toFixed(1)}deg)`);
  }

  // Grayscale for B&W
  if (filter.category === "bw") {
    parts.unshift(`grayscale(${factor.toFixed(3)})`);
  }

  return parts.length > 0 ? parts.join(" ") : "none";
}

export function getOverlaySettings(
  filter: IFilterPreset | null,
  intensity: number = 80
) {
  if (!filter || filter.id === "normal" || intensity === 0) {
    return { grainOpacity: 0, vignetteOpacity: 0, showLightLeak: false };
  }

  const factor = intensity / 100;
  const s = filter.settings;

  return {
    grainOpacity: s.grain ? (s.grain / 100) * factor * 0.45 : 0,
    vignetteOpacity: s.vignette ? (s.vignette / 100) * factor * 0.7 : 0,
    showLightLeak: !!s.lightLeak && intensity > 20,
  };
}
