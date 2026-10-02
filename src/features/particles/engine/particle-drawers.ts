import { Particle } from "../types";

/**
 * High performance HTML5 Canvas drawers for all Phase 6 particle types
 */
export function drawParticle(ctx: CanvasRenderingContext2D, p: Particle): void {
  const progress = p.age / p.maxLife; // 0..1
  if (progress >= 1 || p.opacity <= 0) return;

  // Smooth ease-in (first 15%) and ease-out (last 25%) opacity curve
  let alpha = p.opacity;
  if (progress < 0.15) {
    alpha = p.opacity * (progress / 0.15);
  } else if (progress > 0.75) {
    alpha = p.opacity * (1 - (progress - 0.75) / 0.25);
  }

  if (alpha <= 0.01) return;

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.globalAlpha = Math.min(1, Math.max(0, alpha));

  switch (p.type) {
    case "heart":
      drawHeart(ctx, p);
      break;
    case "sparkle":
      drawSparkle(ctx, p);
      break;
    case "star":
      drawStar(ctx, p);
      break;
    case "snow":
      drawSnow(ctx, p);
      break;
    case "flower":
      drawFlower(ctx, p);
      break;
    case "fire":
      drawFire(ctx, p);
      break;
    case "confetti":
      drawConfetti(ctx, p);
      break;
    case "bubble":
      drawBubble(ctx, p);
      break;
    case "butterfly":
      drawButterfly(ctx, p);
      break;
  }

  ctx.restore();
}

/**
 * 1. HEART PARTICLE
 */
function drawHeart(ctx: CanvasRenderingContext2D, p: Particle): void {
  const s = (p.size * p.scale) / 20;

  ctx.fillStyle = p.color;
  ctx.shadowColor = p.color;
  ctx.shadowBlur = 6;

  ctx.beginPath();
  ctx.moveTo(0, 6 * s);
  ctx.bezierCurveTo(-14 * s, -8 * s, -14 * s, -20 * s, 0, -10 * s);
  ctx.bezierCurveTo(14 * s, -20 * s, 14 * s, -8 * s, 0, 6 * s);
  ctx.closePath();
  ctx.fill();
}

/**
 * 2. SPARKLE PARTICLE (4-point Diamond Starburst)
 */
function drawSparkle(ctx: CanvasRenderingContext2D, p: Particle): void {
  const r = p.size * p.scale;
  ctx.fillStyle = p.color;
  ctx.shadowColor = p.color;
  ctx.shadowBlur = 8;

  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.quadraticCurveTo(0, 0, 0, r);
  ctx.quadraticCurveTo(0, 0, -r, 0);
  ctx.quadraticCurveTo(0, 0, 0, -r);
  ctx.closePath();
  ctx.fill();

  // Central bright core
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * 3. STAR PARTICLE (5-Point Twinkling Star)
 */
function drawStar(ctx: CanvasRenderingContext2D, p: Particle): void {
  const outerR = p.size * p.scale;
  const innerR = outerR * 0.42;
  const points = 5;

  ctx.fillStyle = p.color;
  ctx.shadowColor = p.color;
  ctx.shadowBlur = 6;

  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

/**
 * 4. SNOW PARTICLE (Crystal snowflake with arms)
 */
function drawSnow(ctx: CanvasRenderingContext2D, p: Particle): void {
  const r = p.size * p.scale;

  // Soft glow outer
  ctx.strokeStyle = p.color || "#ffffff";
  ctx.lineWidth = Math.max(1.5, r * 0.2);
  ctx.lineCap = "round";

  // 6 radial snowflake arms
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(x, y);
    ctx.stroke();

    // Small branch on each arm
    const bx = Math.cos(angle) * (r * 0.6);
    const by = Math.sin(angle) * (r * 0.6);
    const branchAngle1 = angle + 0.6;
    const branchAngle2 = angle - 0.6;
    const brLen = r * 0.3;

    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + Math.cos(branchAngle1) * brLen, by + Math.sin(branchAngle1) * brLen);
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + Math.cos(branchAngle2) * brLen, by + Math.sin(branchAngle2) * brLen);
    ctx.stroke();
  }

  // Center ice point
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * 5. FLOWER PARTICLE (Sakura / Cherry Blossom with 3D Tumbling)
 */
function drawFlower(ctx: CanvasRenderingContext2D, p: Particle): void {
  const s = p.size * p.scale;
  // 3D flip effect using cosine scale
  const flip = Math.cos(p.customData?.flipPhase || 0);

  ctx.scale(flip, 1);
  ctx.fillStyle = p.color || "#fbcfe8";

  // Single realistic cherry blossom petal
  ctx.beginPath();
  ctx.moveTo(0, s * 0.7);
  ctx.bezierCurveTo(-s * 0.7, s * 0.3, -s * 0.8, -s * 0.5, -s * 0.2, -s * 0.9);
  ctx.lineTo(0, -s * 0.75); // Notch tip
  ctx.lineTo(s * 0.2, -s * 0.9);
  ctx.bezierCurveTo(s * 0.8, -s * 0.5, s * 0.7, s * 0.3, 0, s * 0.7);
  ctx.closePath();
  ctx.fill();

  // Gentle petal vein
  ctx.strokeStyle = "rgba(244, 63, 94, 0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, s * 0.5);
  ctx.lineTo(0, -s * 0.4);
  ctx.stroke();
}

/**
 * 6. FIRE PARTICLE (Flame Embers with Glowing Core)
 */
function drawFire(ctx: CanvasRenderingContext2D, p: Particle): void {
  const r = p.size * p.scale;

  // Blazing radial gradient
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(0.3, "#fef08a"); // Bright yellow
  grad.addColorStop(0.65, "#f97316"); // Vibrant orange
  grad.addColorStop(1, "rgba(239, 68, 68, 0)"); // Fading red

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * 7. CONFETTI PARTICLE (Ribbon twisting in 3D)
 */
function drawConfetti(ctx: CanvasRenderingContext2D, p: Particle): void {
  const w = p.size * p.scale;
  const h = p.size * 0.45 * p.scale;
  const flip = Math.cos(p.customData?.flipPhase || 0);

  ctx.scale(1, flip);
  ctx.fillStyle = p.color;

  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 2);
  ctx.fill();
}

/**
 * 8. BUBBLE PARTICLE (Translucent Soap Bubble with Rainbow Sheen)
 */
function drawBubble(ctx: CanvasRenderingContext2D, p: Particle): void {
  const r = p.size * p.scale;

  // Thin iridescent soapy rim
  ctx.strokeStyle = "rgba(186, 230, 253, 0.75)";
  ctx.lineWidth = Math.max(1.5, r * 0.08);

  ctx.fillStyle = "rgba(224, 242, 254, 0.15)";
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // White specular glare spot
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.beginPath();
  ctx.arc(-r * 0.35, -r * 0.35, r * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Tiny secondary glare
  ctx.beginPath();
  ctx.arc(r * 0.35, r * 0.35, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * 9. BUTTERFLY PARTICLE (Mini Iridescent Flapping Butterfly)
 */
function drawButterfly(ctx: CanvasRenderingContext2D, p: Particle): void {
  const s = p.size * p.scale;
  const flap = Math.cos(p.customData?.wobblePhase || 0);

  ctx.fillStyle = p.color || "#c084fc"; // Soft lavender / purple

  // Left wing
  ctx.save();
  ctx.scale(flap, 1);
  ctx.beginPath();
  ctx.ellipse(-s * 0.5, 0, s * 0.5, s * 0.6, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Right wing
  ctx.beginPath();
  ctx.ellipse(s * 0.5, 0, s * 0.5, s * 0.6, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Tiny slender body
  ctx.fillStyle = "#1e1b4b";
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.12, s * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
}
