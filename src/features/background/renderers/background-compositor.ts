import { BackgroundSettings } from "../types";
import { PRESET_IMAGES } from "../data/presets";
import { getCachedImage, preloadImage } from "../services/image-loader";
import { globalAnimatedBackground } from "./animated-backgrounds";

let offscreenPersonCanvas: HTMLCanvasElement | null = null;
let offscreenPersonCtx: CanvasRenderingContext2D | null = null;

function getOffscreenPersonCanvas(w: number, h: number) {
  if (!offscreenPersonCanvas) {
    offscreenPersonCanvas = document.createElement("canvas");
    offscreenPersonCtx = offscreenPersonCanvas.getContext("2d", { willReadFrequently: true });
  }
  if (offscreenPersonCanvas.width !== w || offscreenPersonCanvas.height !== h) {
    offscreenPersonCanvas.width = w;
    offscreenPersonCanvas.height = h;
  }
  return { canvas: offscreenPersonCanvas, ctx: offscreenPersonCtx! };
}

/**
 * Renders the chosen background layer onto target canvas context
 */
export function renderBackgroundLayer(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  w: number,
  h: number,
  settings: BackgroundSettings,
  isMirrored: boolean,
  deltaTime: number = 0.016
) {
  const { mode, blurRadius, selectedColor, selectedImageId, selectedAnimatedId, customMedia } =
    settings;

  switch (mode) {
    case "blur": {
      ctx.save();
      // Draw heavily blurred video feed behind subject
      ctx.filter = `blur(${Math.max(4, blurRadius)}px) saturate(1.2)`;
      if (isMirrored) {
        ctx.save();
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, -20, -20, w + 40, h + 40);
        ctx.restore();
      } else {
        ctx.drawImage(video, -20, -20, w + 40, h + 40);
      }
      ctx.filter = "none";
      // Subtle dark vignette to make subject pop
      const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.7);
      vig.addColorStop(0, "rgba(0, 0, 0, 0)");
      vig.addColorStop(1, "rgba(0, 0, 0, 0.35)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
      break;
    }

    case "color": {
      ctx.save();
      if (selectedColor.startsWith("linear-gradient")) {
        // Parse simple 2-color / 3-color linear gradient or fallback to stylish angle
        const grad = ctx.createLinearGradient(0, 0, w, h);
        if (selectedColor.includes("#ff4e50")) {
          grad.addColorStop(0, "#ff4e50");
          grad.addColorStop(1, "#f9d423");
        } else if (selectedColor.includes("#833ab4")) {
          grad.addColorStop(0, "#833ab4");
          grad.addColorStop(0.5, "#fd1d1d");
          grad.addColorStop(1, "#fcb045");
        } else if (selectedColor.includes("#00f260")) {
          grad.addColorStop(0, "#00f260");
          grad.addColorStop(1, "#0575e6");
        } else if (selectedColor.includes("#654ea3")) {
          grad.addColorStop(0, "#654ea3");
          grad.addColorStop(1, "#eaafc8");
        } else if (selectedColor.includes("#0f2027")) {
          grad.addColorStop(0, "#0f2027");
          grad.addColorStop(0.5, "#203a43");
          grad.addColorStop(1, "#2c5364");
        } else {
          grad.addColorStop(0, "#6366f1");
          grad.addColorStop(1, "#ec4899");
        }
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = selectedColor;
      }
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
      break;
    }

    case "image": {
      const preset = PRESET_IMAGES.find((p) => p.id === selectedImageId);
      const imgUrl = customMedia?.type === "image" ? customMedia.url : preset?.imageUrl;

      if (imgUrl) {
        const cached = getCachedImage(imgUrl);
        if (cached) {
          // Draw image with object-fit: cover logic
          const imgAspect = cached.width / cached.height;
          const canvasAspect = w / h;
          let drawW = w;
          let drawH = h;
          let drawX = 0;
          let drawY = 0;

          if (imgAspect > canvasAspect) {
            drawW = h * imgAspect;
            drawX = (w - drawW) / 2;
          } else {
            drawH = w / imgAspect;
            drawY = (h - drawH) / 2;
          }

          ctx.drawImage(cached, drawX, drawY, drawW, drawH);
        } else {
          // Trigger async preload and draw vibrant gradient placeholder
          preloadImage(imgUrl).catch(() => {});
          const grad = ctx.createLinearGradient(0, 0, w, h);
          grad.addColorStop(0, preset?.accentColor || "#3b82f6");
          grad.addColorStop(1, "#09090b");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);
        }
      } else if (preset) {
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, preset.accentColor);
        grad.addColorStop(1, "#09090b");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }
      break;
    }

    case "animated": {
      globalAnimatedBackground.render(ctx, w, h, selectedAnimatedId, deltaTime);
      break;
    }

    case "video": {
      // If custom video URL, draw ambient animated cyber ocean
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#0f172a");
      grad.addColorStop(0.5, "#1e1b4b");
      grad.addColorStop(1, "#020617");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      break;
    }

    default:
      break;
  }
}

/**
 * Composites the segmented person on top of the rendered background
 */
export function compositeSegmentedPerson(
  mainCtx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  maskCanvas: HTMLCanvasElement,
  w: number,
  h: number,
  isMirrored: boolean,
  edgeSoftness: number = 3
) {
  const { canvas: personCanvas, ctx: personCtx } = getOffscreenPersonCanvas(w, h);

  // 1. Clear offscreen canvas
  personCtx.clearRect(0, 0, w, h);

  // 2. Draw person from live video onto offscreen canvas
  personCtx.save();
  if (isMirrored) {
    personCtx.translate(w, 0);
    personCtx.scale(-1, 1);
  }
  personCtx.drawImage(video, 0, 0, w, h);
  personCtx.restore();

  // 3. Mask out non-person areas using the alpha mask
  personCtx.save();
  personCtx.globalCompositeOperation = "destination-in";
  if (edgeSoftness > 0) {
    personCtx.filter = `blur(${edgeSoftness}px)`;
  }
  if (isMirrored) {
    personCtx.translate(w, 0);
    personCtx.scale(-1, 1);
  }
  personCtx.drawImage(maskCanvas, 0, 0, w, h);
  personCtx.filter = "none";
  personCtx.restore();

  // 4. Draw the extracted person on top of the background in main canvas
  mainCtx.drawImage(personCanvas, 0, 0, w, h);
}
