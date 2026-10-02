import { AREffectRenderContext } from "../types";
import { getFaceAnchorMetrics, withFaceTransform } from "./ar-geometry";

/**
 * 1. CAT EFFECT (Ears, Whisker Lines, Pink Nose, Rosy Cheeks)
 */
export function drawCatEffect(ctxObj: AREffectRenderContext) {
  const { ctx, face, canvasWidth, canvasHeight, isMirrored, timeMs } = ctxObj;
  const m = getFaceAnchorMetrics(face, canvasWidth, canvasHeight, isMirrored);
  const size = m.eyeDistance;

  // Ear wiggle animation when smiling
  const isSmiling = face.expressions.isSmiling;
  const wiggle = isSmiling ? Math.sin(timeMs / 60) * 0.12 : 0;

  // Ears on Head Top
  withFaceTransform(ctx, m.headTop, m.rollRad + wiggle, 1, 1, () => {
    const earDist = size * 1.05;
    const earW = size * 0.75;
    const earH = size * 1.05;

    // Left Ear
    drawSingleCatEar(ctx, -earDist / 2, -earH * 0.5, earW, earH, -0.2);
    // Right Ear
    drawSingleCatEar(ctx, earDist / 2, -earH * 0.5, earW, earH, 0.2);
  });

  // Pink Nose
  withFaceTransform(ctx, m.noseTip, m.rollRad, 1, 1, () => {
    ctx.fillStyle = "#f472b6";
    ctx.beginPath();
    ctx.moveTo(0, size * 0.08);
    ctx.lineTo(-size * 0.14, -size * 0.08);
    ctx.lineTo(size * 0.14, -size * 0.08);
    ctx.closePath();
    ctx.fill();
  });

  // Whiskers on Cheeks
  withFaceTransform(ctx, m.noseTip, m.rollRad, 1, 1, () => {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    ctx.lineWidth = Math.max(2, size * 0.035);
    ctx.lineCap = "round";

    const wLen = size * 0.95;
    const startX = size * 0.22;

    // Left Whiskers
    [-0.15, 0, 0.15].forEach((angle) => {
      ctx.beginPath();
      ctx.moveTo(-startX, 0);
      ctx.lineTo(-startX - wLen * Math.cos(angle), -wLen * Math.sin(angle));
      ctx.stroke();
    });

    // Right Whiskers
    [-0.15, 0, 0.15].forEach((angle) => {
      ctx.beginPath();
      ctx.moveTo(startX, 0);
      ctx.lineTo(startX + wLen * Math.cos(angle), -wLen * Math.sin(angle));
      ctx.stroke();
    });
  });

  // Rosy Cheeks
  drawBlushPills(ctx, m.leftCheek, m.rightCheek, size * 0.45, "rgba(251, 113, 133, 0.45)");
}

function drawSingleCatEar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  tilt: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);

  // Outer ear (dark/black)
  ctx.fillStyle = "#1e293b";
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-w / 2, h / 2);
  ctx.quadraticCurveTo(-w * 0.2, -h * 0.7, 0, -h);
  ctx.quadraticCurveTo(w * 0.2, -h * 0.7, w / 2, h / 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner ear (pink)
  ctx.fillStyle = "#f472b6";
  ctx.beginPath();
  ctx.moveTo(-w * 0.3, h * 0.35);
  ctx.quadraticCurveTo(-w * 0.1, -h * 0.4, 0, -h * 0.7);
  ctx.quadraticCurveTo(w * 0.1, -h * 0.4, w * 0.3, h * 0.35);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * 2. BUNNY EFFECT (Tall Bunny Ears, Cute Nose, Blush)
 */
export function drawBunnyEffect(ctxObj: AREffectRenderContext) {
  const { ctx, face, canvasWidth, canvasHeight, isMirrored, timeMs } = ctxObj;
  const m = getFaceAnchorMetrics(face, canvasWidth, canvasHeight, isMirrored);
  const size = m.eyeDistance;

  // Gentle ear bobbing
  const bob = Math.sin(timeMs / 180) * 0.05;

  withFaceTransform(ctx, m.headTop, m.rollRad + bob, 1, 1, () => {
    const earW = size * 0.45;
    const earH = size * 1.9;
    const earSep = size * 0.55;

    // Left bunny ear
    drawSingleBunnyEar(ctx, -earSep, -earH * 0.45, earW, earH, -0.1);
    // Right bunny ear
    drawSingleBunnyEar(ctx, earSep, -earH * 0.45, earW, earH, 0.1);
  });

  // Bunny Nose
  withFaceTransform(ctx, m.noseTip, m.rollRad, 1, 1, () => {
    ctx.fillStyle = "#fb7185";
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.12, size * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // Soft Peach Blush
  drawBlushPills(ctx, m.leftCheek, m.rightCheek, size * 0.5, "rgba(244, 114, 182, 0.4)");
}

function drawSingleBunnyEar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  tilt: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);

  // Outer ear (white with soft grey border)
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.4, w * 0.5, h * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Inner ear (soft pink)
  ctx.fillStyle = "#fbcfe8";
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.4, w * 0.28, h * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * 3. DOG EFFECT (Floppy Ears, Tongue Out on Mouth Open)
 */
export function drawDogEffect(ctxObj: AREffectRenderContext) {
  const { ctx, face, canvasWidth, canvasHeight, isMirrored, timeMs } = ctxObj;
  const m = getFaceAnchorMetrics(face, canvasWidth, canvasHeight, isMirrored);
  const size = m.eyeDistance;

  // Floppy Dog Ears on sides
  withFaceTransform(ctx, m.headTop, m.rollRad, 1, 1, () => {
    const earW = size * 0.7;
    const earH = size * 1.4;
    const sway = Math.sin(timeMs / 140) * 0.06;

    // Left floppy ear
    ctx.save();
    ctx.translate(-size * 1.05, 0);
    ctx.rotate(-0.35 + sway);
    ctx.fillStyle = "#92400e"; // Brown
    ctx.beginPath();
    ctx.ellipse(0, earH * 0.4, earW * 0.5, earH * 0.5, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Right floppy ear
    ctx.save();
    ctx.translate(size * 1.05, 0);
    ctx.rotate(0.35 - sway);
    ctx.fillStyle = "#92400e";
    ctx.beginPath();
    ctx.ellipse(0, earH * 0.4, earW * 0.5, earH * 0.5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Black Dog Nose
  withFaceTransform(ctx, m.noseTip, m.rollRad, 1, 1, () => {
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.18, size * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    // Highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.beginPath();
    ctx.ellipse(-size * 0.05, -size * 0.04, size * 0.04, size * 0.025, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // Interactive Puppy Tongue when mouth open!
  if (face.expressions.isMouthOpen) {
    withFaceTransform(ctx, m.mouthCenter, m.rollRad, 1, 1, () => {
      const tongueW = size * 0.35;
      const tongueH = size * 0.65;
      ctx.fillStyle = "#f43f5e";
      ctx.beginPath();
      ctx.ellipse(0, tongueH * 0.4, tongueW * 0.5, tongueH * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tongue midline
      ctx.strokeStyle = "#be123c";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, tongueH * 0.7);
      ctx.stroke();
    });
  }
}

/**
 * 4. HEART SUNGLASSES
 */
export function drawHeartGlasses(ctxObj: AREffectRenderContext) {
  const { ctx, face, canvasWidth, canvasHeight, isMirrored } = ctxObj;
  const m = getFaceAnchorMetrics(face, canvasWidth, canvasHeight, isMirrored);
  const size = m.eyeDistance;

  withFaceTransform(ctx, m.eyesCenter, m.rollRad, 1, 1, () => {
    const heartScale = size * 0.038;

    // Left Heart Lens
    ctx.save();
    ctx.translate(-size * 0.5, 0);
    drawSingleHeartLens(ctx, heartScale);
    ctx.restore();

    // Right Heart Lens
    ctx.save();
    ctx.translate(size * 0.5, 0);
    drawSingleHeartLens(ctx, heartScale);
    ctx.restore();

    // Golden frame bridge connecting the hearts
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, -size * 0.05, size * 0.22, 0.8 * Math.PI, 0.2 * Math.PI, true);
    ctx.stroke();
  });
}

function drawSingleHeartLens(ctx: CanvasRenderingContext2D, s: number) {
  // Semi-transparent ruby pink glass gradient
  const grad = ctx.createLinearGradient(0, -15 * s, 0, 15 * s);
  grad.addColorStop(0, "rgba(244, 63, 94, 0.9)");
  grad.addColorStop(1, "rgba(217, 70, 239, 0.85)");

  ctx.fillStyle = grad;
  ctx.strokeStyle = "#fbbf24"; // Gold frame rim
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(0, 5 * s);
  ctx.bezierCurveTo(-15 * s, -10 * s, -15 * s, -22 * s, 0, -12 * s);
  ctx.bezierCurveTo(15 * s, -22 * s, 15 * s, -10 * s, 0, 5 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // White gloss glare streak
  ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(-5 * s, -12 * s, 4 * s, 1.2 * Math.PI, 1.7 * Math.PI);
  ctx.stroke();
}

/**
 * 5. COOL SUNGLASSES (Matrix / Retro shades with reflection)
 */
export function drawCoolShades(ctxObj: AREffectRenderContext) {
  const { ctx, face, canvasWidth, canvasHeight, isMirrored } = ctxObj;
  const m = getFaceAnchorMetrics(face, canvasWidth, canvasHeight, isMirrored);
  const size = m.eyeDistance;

  withFaceTransform(ctx, m.eyesCenter, m.rollRad, 1, 1, () => {
    const w = size * 2.2;
    const h = size * 0.65;

    // Dark sleek frame
    ctx.fillStyle = "#09090b";
    ctx.strokeStyle = "#27272a";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, [12, 12, 8, 8]);
    ctx.fill();
    ctx.stroke();

    // White gloss diagonal reflection streaks
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.beginPath();
    ctx.moveTo(-w * 0.25, -h * 0.4);
    ctx.lineTo(-w * 0.15, -h * 0.4);
    ctx.lineTo(-w * 0.35, h * 0.4);
    ctx.lineTo(-w * 0.45, h * 0.4);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(w * 0.15, -h * 0.4);
    ctx.lineTo(w * 0.25, -h * 0.4);
    ctx.lineTo(w * 0.05, h * 0.4);
    ctx.lineTo(-w * 0.05, h * 0.4);
    ctx.closePath();
    ctx.fill();
  });
}

/**
 * 6. ROYAL CROWN
 */
export function drawRoyalCrown(ctxObj: AREffectRenderContext) {
  const { ctx, face, canvasWidth, canvasHeight, isMirrored, timeMs } = ctxObj;
  const m = getFaceAnchorMetrics(face, canvasWidth, canvasHeight, isMirrored);
  const size = m.eyeDistance;

  // Floating breathing animation
  const floatY = Math.sin(timeMs / 250) * (size * 0.06);

  withFaceTransform(ctx, { x: m.headTop.x, y: m.headTop.y + floatY }, m.rollRad, 1, 1, () => {
    const crownW = size * 1.5;
    const crownH = size * 0.95;

    // Golden gradient fill
    const grad = ctx.createLinearGradient(0, -crownH, 0, 0);
    grad.addColorStop(0, "#fef08a");
    grad.addColorStop(0.5, "#eab308");
    grad.addColorStop(1, "#ca8a04");

    ctx.fillStyle = grad;
    ctx.strokeStyle = "#a16207";
    ctx.lineWidth = 3;

    // 5-point crown path
    ctx.beginPath();
    ctx.moveTo(-crownW / 2, 0);
    ctx.lineTo(-crownW / 2, -crownH * 0.7);
    ctx.lineTo(-crownW * 0.25, -crownH * 0.45);
    ctx.lineTo(0, -crownH); // Center tallest peak
    ctx.lineTo(crownW * 0.25, -crownH * 0.45);
    ctx.lineTo(crownW / 2, -crownH * 0.7);
    ctx.lineTo(crownW / 2, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Jewel gems on peaks
    const jewels = [
      { x: -crownW / 2, y: -crownH * 0.7, color: "#38bdf8" }, // Blue
      { x: 0, y: -crownH, color: "#ef4444" },                 // Red Ruby
      { x: crownW / 2, y: -crownH * 0.7, color: "#38bdf8" },  // Blue
    ];

    for (const j of jewels) {
      ctx.fillStyle = j.color;
      ctx.beginPath();
      ctx.arc(j.x, j.y, size * 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  });
}

/**
 * 7. ANGEL HALO
 */
export function drawAngelHalo(ctxObj: AREffectRenderContext) {
  const { ctx, face, canvasWidth, canvasHeight, isMirrored, timeMs } = ctxObj;
  const m = getFaceAnchorMetrics(face, canvasWidth, canvasHeight, isMirrored);
  const size = m.eyeDistance;

  // Floating hover animation
  const hoverY = Math.sin(timeMs / 280) * (size * 0.08) - size * 0.6;

  withFaceTransform(ctx, { x: m.headTop.x, y: m.headTop.y + hoverY }, m.rollRad, 1, 1, () => {
    const rx = size * 0.95;
    const ry = size * 0.3;

    // Outer glow
    ctx.save();
    ctx.shadowColor = "#facc15";
    ctx.shadowBlur = 18;
    ctx.strokeStyle = "#fef08a";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Core bright ring
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
  });
}

/**
 * 8. DEVIL HORNS
 */
export function drawDevilHorns(ctxObj: AREffectRenderContext) {
  const { ctx, face, canvasWidth, canvasHeight, isMirrored } = ctxObj;
  const m = getFaceAnchorMetrics(face, canvasWidth, canvasHeight, isMirrored);
  const size = m.eyeDistance;

  withFaceTransform(ctx, m.forehead, m.rollRad, 1, 1, () => {
    const hornSep = size * 0.85;
    const hornH = size * 0.95;

    // Left Horn
    drawSingleHorn(ctx, -hornSep / 2, -hornH * 0.2, size * 0.4, hornH, -0.2);
    // Right Horn
    drawSingleHorn(ctx, hornSep / 2, -hornH * 0.2, size * 0.4, hornH, 0.2);
  });
}

function drawSingleHorn(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  tilt: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);

  ctx.shadowColor = "#dc2626";
  ctx.shadowBlur = 12;

  const grad = ctx.createLinearGradient(0, 0, 0, -h);
  grad.addColorStop(0, "#450a0a");
  grad.addColorStop(0.7, "#dc2626");
  grad.addColorStop(1, "#f87171");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-w / 2, 0);
  ctx.quadraticCurveTo(-w * 0.2, -h * 0.6, 0, -h);
  ctx.quadraticCurveTo(w * 0.8, -h * 0.5, w / 2, 0);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * 9. FLOWER CROWN
 */
export function drawFlowerCrown(ctxObj: AREffectRenderContext) {
  const { ctx, face, canvasWidth, canvasHeight, isMirrored } = ctxObj;
  const m = getFaceAnchorMetrics(face, canvasWidth, canvasHeight, isMirrored);
  const size = m.eyeDistance;

  withFaceTransform(ctx, m.forehead, m.rollRad, 1, 1, () => {
    const crownW = size * 1.5;
    const flowerCount = 7;
    const colors = ["#f472b6", "#fbcfe8", "#ffffff", "#f43f5e", "#fed7aa", "#f472b6", "#fbcfe8"];

    for (let i = 0; i < flowerCount; i++) {
      const t = i / (flowerCount - 1);
      const fx = -crownW / 2 + t * crownW;
      const fy = -size * 0.35 + Math.sin(t * Math.PI) * (-size * 0.15);

      drawSingleFlower(ctx, fx, fy, size * 0.22, colors[i]);
    }
  });
}

function drawSingleFlower(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string
) {
  ctx.save();
  ctx.translate(x, y);

  // Petals
  ctx.fillStyle = color;
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5;
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * r * 0.5, Math.sin(angle) * r * 0.5, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  // Golden Center
  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * 10. FRECKLES & BLUSH
 */
export function drawFrecklesAndBlush(ctxObj: AREffectRenderContext) {
  const { ctx, face, canvasWidth, canvasHeight, isMirrored } = ctxObj;
  const m = getFaceAnchorMetrics(face, canvasWidth, canvasHeight, isMirrored);
  const size = m.eyeDistance;

  // Rosy cheeks
  drawBlushPills(ctx, m.leftCheek, m.rightCheek, size * 0.55, "rgba(251, 113, 133, 0.42)");

  // Freckle dots on nose bridge & cheeks
  withFaceTransform(ctx, m.noseTip, m.rollRad, 1, 1, () => {
    ctx.fillStyle = "rgba(180, 83, 9, 0.65)";
    const freckleOffsets = [
      { x: -size * 0.25, y: -size * 0.1 },
      { x: -size * 0.18, y: -size * 0.15 },
      { x: -size * 0.1, y: -size * 0.12 },
      { x: -size * 0.05, y: -size * 0.2 },
      { x: size * 0.05, y: -size * 0.18 },
      { x: size * 0.12, y: -size * 0.1 },
      { x: size * 0.2, y: -size * 0.14 },
      { x: size * 0.28, y: -size * 0.08 },
    ];

    for (const f of freckleOffsets) {
      ctx.beginPath();
      ctx.arc(f.x, f.y, size * 0.022, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

/**
 * 11. CHEEK HEARTS
 */
export function drawCheekHearts(ctxObj: AREffectRenderContext) {
  const { ctx, face, canvasWidth, canvasHeight, isMirrored } = ctxObj;
  const m = getFaceAnchorMetrics(face, canvasWidth, canvasHeight, isMirrored);
  const size = m.eyeDistance;

  const heartScale = size * 0.016;

  [m.leftCheek, m.rightCheek].forEach((cheek) => {
    withFaceTransform(ctx, cheek, m.rollRad, 1, 1, () => {
      ctx.fillStyle = "rgba(244, 63, 94, 0.85)";
      ctx.beginPath();
      ctx.moveTo(0, 5 * heartScale);
      ctx.bezierCurveTo(-15 * heartScale, -10 * heartScale, -15 * heartScale, -22 * heartScale, 0, -12 * heartScale);
      ctx.bezierCurveTo(15 * heartScale, -22 * heartScale, 15 * heartScale, -10 * heartScale, 0, 5 * heartScale);
      ctx.closePath();
      ctx.fill();
    });
  });
}

/**
 * 12. STAR GLITTER IDOL
 */
export function drawStarGlitter(ctxObj: AREffectRenderContext) {
  const { ctx, face, canvasWidth, canvasHeight, isMirrored, timeMs } = ctxObj;
  const m = getFaceAnchorMetrics(face, canvasWidth, canvasHeight, isMirrored);
  const size = m.eyeDistance;

  const pulse = Math.abs(Math.sin(timeMs / 200)) * 0.3 + 0.8;

  [m.leftEye, m.rightEye].forEach((eye) => {
    withFaceTransform(ctx, { x: eye.x, y: eye.y + size * 0.3 }, m.rollRad, pulse, pulse, () => {
      drawFourPointStar(ctx, 0, 0, size * 0.12, "#fde047");
      drawFourPointStar(ctx, size * 0.16, size * 0.08, size * 0.08, "#38bdf8");
    });
  });
}

function drawFourPointStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;

  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.quadraticCurveTo(0, 0, 0, r);
  ctx.quadraticCurveTo(0, 0, -r, 0);
  ctx.quadraticCurveTo(0, 0, 0, -r);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * 13. BUTTERFLIES
 */
export function drawButterflies(ctxObj: AREffectRenderContext) {
  const { ctx, face, canvasWidth, canvasHeight, isMirrored, timeMs } = ctxObj;
  const m = getFaceAnchorMetrics(face, canvasWidth, canvasHeight, isMirrored);
  const size = m.eyeDistance;

  const flap = Math.cos(timeMs / 120);

  withFaceTransform(ctx, { x: m.rightCheek.x + size * 0.25, y: m.rightCheek.y - size * 0.2 }, m.rollRad - 0.2, 1, 1, () => {
    // Fluttering butterfly
    const bW = size * 0.28 * Math.abs(flap);
    const bH = size * 0.28;

    ctx.fillStyle = "#818cf8"; // Periwinkle purple
    // Left wing
    ctx.beginPath();
    ctx.ellipse(-bW * 0.5, 0, bW * 0.5, bH * 0.5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    // Right wing
    ctx.beginPath();
    ctx.ellipse(bW * 0.5, 0, bW * 0.5, bH * 0.5, 0.3, 0, Math.PI * 2);
    ctx.fill();
  });
}

/**
 * 14. ANIME TEARS
 */
export function drawAnimeTears(ctxObj: AREffectRenderContext) {
  const { ctx, face, canvasWidth, canvasHeight, isMirrored, timeMs } = ctxObj;
  const m = getFaceAnchorMetrics(face, canvasWidth, canvasHeight, isMirrored);
  const size = m.eyeDistance;

  const streamOffset = (timeMs % 600) / 600;

  [m.leftEye, m.rightEye].forEach((eye) => {
    withFaceTransform(ctx, eye, m.rollRad, 1, 1, () => {
      ctx.fillStyle = "rgba(56, 189, 248, 0.75)";
      const tearLen = size * 1.2;
      const tearW = size * 0.2;

      // Waterfall tear stream
      ctx.beginPath();
      ctx.moveTo(-tearW / 2, size * 0.1);
      ctx.lineTo(tearW / 2, size * 0.1);
      ctx.lineTo(tearW * 0.3, tearLen);
      ctx.lineTo(-tearW * 0.3, tearLen);
      ctx.closePath();
      ctx.fill();

      // Flowing ripple
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.beginPath();
      ctx.arc(0, size * 0.1 + streamOffset * tearLen * 0.8, size * 0.05, 0, Math.PI * 2);
      ctx.fill();
    });
  });
}

/**
 * Helper to draw rosy blush pills on both cheeks
 */
function drawBlushPills(
  ctx: CanvasRenderingContext2D,
  leftCheek: { x: number; y: number },
  rightCheek: { x: number; y: number },
  radius: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;

  // Left Cheek
  ctx.beginPath();
  ctx.ellipse(leftCheek.x, leftCheek.y, radius, radius * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  // Right Cheek
  ctx.beginPath();
  ctx.ellipse(rightCheek.x, rightCheek.y, radius, radius * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
