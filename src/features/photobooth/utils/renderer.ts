import { IBoothLayout } from "@/types";
import { FrameSettings } from "@/stores/useBoothStore";

// Helper to load image
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

// Draw rounded rectangle path
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Format date
function getFormattedDate(format: string): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  if (format === "DD/MM/YYYY") return `${dd}/${mm}/${yyyy}`;
  if (format === "MMM DD, YYYY") {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[now.getMonth()]} ${dd}, ${yyyy}`;
  }
  return `${yyyy}.${mm}.${dd}`;
}

export interface RenderPhotoboothOptions {
  layout: IBoothLayout;
  slotAssignments: Record<string, string>; // slotId -> dataUrl
  frameSettings: FrameSettings;
  scale?: number; // scale factor (default 2x for retina / 300DPI crisp export)
}

export async function renderPhotoboothStrip(
  options: RenderPhotoboothOptions
): Promise<string> {
  const { layout, slotAssignments, frameSettings, scale = 2 } = options;

  const canvasWidth = layout.width * scale;
  const canvasHeight = layout.height * scale;

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  // 1. Draw Frame Background
  if (frameSettings.backgroundType === "gradient") {
    let grad: CanvasGradient;
    if (frameSettings.gradientDirection === "to-r") {
      grad = ctx.createLinearGradient(0, 0, canvasWidth, 0);
    } else if (frameSettings.gradientDirection === "to-tr") {
      grad = ctx.createLinearGradient(0, canvasHeight, canvasWidth, 0);
    } else if (frameSettings.gradientDirection === "to-br") {
      grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    } else {
      grad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    }
    grad.addColorStop(0, frameSettings.gradientFrom);
    grad.addColorStop(1, frameSettings.gradientTo);
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = frameSettings.backgroundColor;
  }
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 2. Draw outer border if configured
  if (frameSettings.borderWidth > 0) {
    ctx.lineWidth = frameSettings.borderWidth * scale;
    ctx.strokeStyle = frameSettings.borderColor;
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
  }

  // 3. Render Each Slot Photo
  for (const slot of layout.slots) {
    const shotDataUrl = slotAssignments[slot.id];
    const sx = slot.x * scale;
    const sy = slot.y * scale;
    const sWidth = slot.width * scale;
    const sHeight = slot.height * scale;
    const sRadius = (slot.borderRadius ?? frameSettings.borderRadius) * scale;

    ctx.save();

    // Clip to slot rounded rectangle
    roundRect(ctx, sx, sy, sWidth, sHeight, sRadius);
    ctx.clip();

    if (shotDataUrl) {
      try {
        const img = await loadImage(shotDataUrl);
        const imgAspect = img.width / img.height;
        const slotAspect = sWidth / sHeight;

        let drawW = sWidth;
        let drawH = sHeight;
        let dx = sx;
        let dy = sy;

        if (imgAspect > slotAspect) {
          drawW = sHeight * imgAspect;
          dx = sx - (drawW - sWidth) / 2;
        } else {
          drawH = sWidth / imgAspect;
          dy = sy - (drawH - sHeight) / 2;
        }

        ctx.drawImage(img, dx, dy, drawW, drawH);
      } catch (err) {
        console.warn(`Failed to render slot ${slot.id}:`, err);
        // Fallback fill
        ctx.fillStyle = "#1E293B";
        ctx.fillRect(sx, sy, sWidth, sHeight);
      }
    } else {
      // Empty slot placeholder fill
      ctx.fillStyle = "rgba(15, 23, 42, 0.08)";
      ctx.fillRect(sx, sy, sWidth, sHeight);
    }

    ctx.restore();

    // Draw slot stroke if configured
    if (frameSettings.borderWidth > 0) {
      ctx.save();
      roundRect(ctx, sx, sy, sWidth, sHeight, sRadius);
      ctx.lineWidth = Math.max(1, (frameSettings.borderWidth / 2) * scale);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
      ctx.stroke();
      ctx.restore();
    }
  }

  // 4. Render Footer Brand / Custom Text & Date Stamp
  const textY = canvasHeight - 28 * scale;

  ctx.save();
  ctx.fillStyle = frameSettings.textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Main Header / Caption text
  const fontSize = Math.max(12, Math.round(14 * scale));
  ctx.font = `bold ${fontSize}px ${frameSettings.fontFamily}`;
  ctx.fillText(frameSettings.footerText || "PHOTO BOOTH ✦ STUDIO", canvasWidth / 2, textY - 8 * scale);

  // Subtext / Date Stamp
  if (frameSettings.showDate) {
    const subFontSize = Math.max(10, Math.round(10 * scale));
    ctx.font = `500 ${subFontSize}px ${frameSettings.fontFamily}`;
    const dateStr = getFormattedDate(frameSettings.dateFormat);
    const subtext = frameSettings.footerSubtext
      ? `${frameSettings.footerSubtext}  •  ${dateStr}`
      : dateStr;
    ctx.globalAlpha = 0.8;
    ctx.fillText(subtext, canvasWidth / 2, textY + 12 * scale);
  }

  ctx.restore();

  return canvas.toDataURL("image/png", 1.0);
}
