import { AnimatedBackgroundType } from "../types";

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  wind: number;
  swayOffset: number;
  swaySpeed: number;
  opacity: number;
}

interface Raindrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  thickness: number;
}

interface CloudLayer {
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  speed: number;
  opacity: number;
  color: string;
}

interface BokehHeart {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  scale: number;
  pulsateSpeed: number;
  angle: number;
}

interface SakuraPetal {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  flip: number;
  flipSpeed: number;
  opacity: number;
  color: string;
}

export class AnimatedBackgroundEngine {
  private snowflakes: Snowflake[] = [];
  private raindrops: Raindrop[] = [];
  private clouds: CloudLayer[] = [];
  private hearts: BokehHeart[] = [];
  private petals: SakuraPetal[] = [];
  private gridOffset: number = 0;
  private time: number = 0;
  private width: number = 0;
  private height: number = 0;
  private currentType: AnimatedBackgroundType | null = null;

  public resize(width: number, height: number) {
    if (this.width === width && this.height === height) return;
    this.width = width;
    this.height = height;
    if (this.currentType) {
      this.initType(this.currentType);
    }
  }

  public setType(type: AnimatedBackgroundType) {
    if (this.currentType === type) return;
    this.currentType = type;
    this.initType(type);
  }

  private initType(type: AnimatedBackgroundType) {
    const w = this.width || 800;
    const h = this.height || 600;

    switch (type) {
      case "snow":
        this.snowflakes = Array.from({ length: 65 }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          radius: Math.random() * 3.5 + 1.2,
          speed: Math.random() * 45 + 25,
          wind: Math.random() * 15 - 7.5,
          swayOffset: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 2 + 1,
          opacity: Math.random() * 0.7 + 0.3,
        }));
        break;

      case "rain":
        this.raindrops = Array.from({ length: 90 }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          length: Math.random() * 25 + 15,
          speed: Math.random() * 400 + 350,
          opacity: Math.random() * 0.5 + 0.3,
          thickness: Math.random() * 1.5 + 1,
        }));
        break;

      case "cloud":
        this.clouds = [
          { x: w * 0.1, y: h * 0.25, radiusX: w * 0.45, radiusY: h * 0.2, speed: 12, opacity: 0.35, color: "#e0e7ff" },
          { x: w * 0.6, y: h * 0.4, radiusX: w * 0.55, radiusY: h * 0.25, speed: 18, opacity: 0.28, color: "#fce7f3" },
          { x: w * 0.3, y: h * 0.65, radiusX: w * 0.5, radiusY: h * 0.22, speed: 15, opacity: 0.32, color: "#fed7aa" },
          { x: w * 0.85, y: h * 0.15, radiusX: w * 0.4, radiusY: h * 0.18, speed: 22, opacity: 0.22, color: "#ede9fe" },
        ];
        break;

      case "neon":
        this.gridOffset = 0;
        break;

      case "heart":
        this.hearts = Array.from({ length: 30 }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 18 + 10,
          speedY: Math.random() * 35 + 20,
          speedX: Math.random() * 15 - 7.5,
          opacity: Math.random() * 0.6 + 0.3,
          scale: 1,
          pulsateSpeed: Math.random() * 3 + 2,
          angle: (Math.random() - 0.5) * 0.4,
        }));
        break;

      case "cherry_blossom":
        this.petals = Array.from({ length: 45 }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 14 + 8,
          speedX: Math.random() * 35 + 20,
          speedY: Math.random() * 45 + 30,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 2,
          flip: Math.random() * Math.PI,
          flipSpeed: Math.random() * 2 + 1.5,
          opacity: Math.random() * 0.6 + 0.4,
          color: Math.random() > 0.4 ? "#fbcfe8" : "#f472b6",
        }));
        break;
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    type: AnimatedBackgroundType,
    deltaTime: number = 0.016
  ) {
    if (this.width !== width || this.height !== height) {
      this.resize(width, height);
    }
    if (this.currentType !== type) {
      this.setType(type);
    }

    this.time += deltaTime;

    switch (type) {
      case "snow":
        this.renderSnow(ctx, width, height, deltaTime);
        break;
      case "rain":
        this.renderRain(ctx, width, height, deltaTime);
        break;
      case "cloud":
        this.renderClouds(ctx, width, height, deltaTime);
        break;
      case "neon":
        this.renderNeon(ctx, width, height, deltaTime);
        break;
      case "heart":
        this.renderHearts(ctx, width, height, deltaTime);
        break;
      case "cherry_blossom":
        this.renderSakura(ctx, width, height, deltaTime);
        break;
    }
  }

  private renderSnow(ctx: CanvasRenderingContext2D, w: number, h: number, dt: number) {
    // Winter night sky background
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#090d16");
    sky.addColorStop(0.5, "#0f172a");
    sky.addColorStop(1, "#1e293b");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Render snowflakes
    ctx.save();
    for (const s of this.snowflakes) {
      s.y += s.speed * dt;
      s.x += Math.sin(this.time * s.swaySpeed + s.swayOffset) * 1.2 + s.wind * dt;

      if (s.y > h + 10) {
        s.y = -10;
        s.x = Math.random() * w;
      }
      if (s.x > w + 10) s.x = -10;
      if (s.x < -10) s.x = w + 10;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
      ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
      ctx.shadowBlur = s.radius * 2;
      ctx.fill();
    }
    ctx.restore();
  }

  private renderRain(ctx: CanvasRenderingContext2D, w: number, h: number, dt: number) {
    // Cinematic rainy moody background
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "#050811");
    bg.addColorStop(0.5, "#0d131f");
    bg.addColorStop(1, "#111827");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.strokeStyle = "rgba(186, 230, 253, 0.65)";
    ctx.lineWidth = 1.4;

    for (const r of this.raindrops) {
      r.y += r.speed * dt;
      r.x -= 35 * dt; // Slight wind slant

      if (r.y > h + 20) {
        r.y = -20;
        r.x = Math.random() * (w + 50);
      }

      ctx.beginPath();
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x - 4, r.y + r.length);
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderClouds(ctx: CanvasRenderingContext2D, w: number, h: number, dt: number) {
    // Soft pastel sunset sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#c4b5fd");
    sky.addColorStop(0.4, "#f472b6");
    sky.addColorStop(0.8, "#fed7aa");
    sky.addColorStop(1, "#fef08a");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Drifting soft cloud puff ellipses
    ctx.save();
    for (const c of this.clouds) {
      c.x += c.speed * dt;
      if (c.x - c.radiusX > w) {
        c.x = -c.radiusX;
      }

      const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.radiusX);
      grad.addColorStop(0, c.color);
      grad.addColorStop(0.6, `${c.color}99`);
      grad.addColorStop(1, `${c.color}00`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.radiusX, c.radiusY, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private renderNeon(ctx: CanvasRenderingContext2D, w: number, h: number, dt: number) {
    // Synthwave deep purple/black space sky
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#05020c");
    sky.addColorStop(0.5, "#1f0933");
    sky.addColorStop(0.55, "#701a75");
    sky.addColorStop(1, "#030008");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    const horizon = h * 0.55;

    // Glowing synthwave sun
    const sunGrad = ctx.createRadialGradient(w / 2, horizon - 20, 10, w / 2, horizon - 20, h * 0.28);
    sunGrad.addColorStop(0, "#fde047");
    sunGrad.addColorStop(0.4, "#f43f5e");
    sunGrad.addColorStop(0.8, "#a855f7");
    sunGrad.addColorStop(1, "transparent");
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(w / 2, horizon - 20, h * 0.28, Math.PI, 0, false);
    ctx.fill();

    // Horizon neon line
    ctx.save();
    ctx.strokeStyle = "#06b6d4";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#06b6d4";
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.lineTo(w, horizon);
    ctx.stroke();

    // Moving perspective grid floor
    this.gridOffset = (this.gridOffset + 60 * dt) % 40;

    ctx.strokeStyle = "rgba(236, 72, 153, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.shadowColor = "#ec4899";
    ctx.shadowBlur = 8;

    // Longitudinal grid lines spreading from center horizon
    const cols = 14;
    for (let i = -cols; i <= cols; i++) {
      const startX = w / 2 + (i * w) / (cols * 3.5);
      const endX = w / 2 + (i * w * 1.2);
      ctx.beginPath();
      ctx.moveTo(startX, horizon);
      ctx.lineTo(endX, h);
      ctx.stroke();
    }

    // Latitudinal moving lines with exponential perspective spacing
    for (let y = horizon + this.gridOffset; y < h; y += 35) {
      const progress = (y - horizon) / (h - horizon);
      const curvedY = horizon + Math.pow(progress, 1.8) * (h - horizon);
      ctx.beginPath();
      ctx.moveTo(0, curvedY);
      ctx.lineTo(w, curvedY);
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderHearts(ctx: CanvasRenderingContext2D, w: number, h: number, dt: number) {
    // Warm romantic dark ruby / violet gradient
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "#19030b");
    bg.addColorStop(0.5, "#3b071e");
    bg.addColorStop(1, "#500724");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    for (const heart of this.hearts) {
      heart.y -= heart.speedY * dt;
      heart.x += Math.sin(this.time * 2 + heart.x) * (heart.speedX * dt);

      if (heart.y < -30) {
        heart.y = h + 30;
        heart.x = Math.random() * w;
      }

      ctx.save();
      ctx.translate(heart.x, heart.y);
      const pulsate = 1 + Math.sin(this.time * heart.pulsateSpeed) * 0.15;
      ctx.scale(pulsate, pulsate);
      ctx.rotate(heart.angle);

      // Draw glowing heart vector
      ctx.fillStyle = `rgba(244, 63, 94, ${heart.opacity})`;
      ctx.shadowColor = "rgba(251, 113, 133, 0.7)";
      ctx.shadowBlur = 12;

      ctx.beginPath();
      const s = heart.size;
      ctx.moveTo(0, -s * 0.3);
      ctx.bezierCurveTo(-s * 0.5, -s * 0.9, -s, -s * 0.4, -s, 0);
      ctx.bezierCurveTo(-s, s * 0.5, 0, s * 0.8, 0, s);
      ctx.bezierCurveTo(0, s * 0.8, s, s * 0.5, s, 0);
      ctx.bezierCurveTo(s, -s * 0.4, s * 0.5, -s * 0.9, 0, -s * 0.3);
      ctx.fill();

      ctx.restore();
    }
    ctx.restore();
  }

  private renderSakura(ctx: CanvasRenderingContext2D, w: number, h: number, dt: number) {
    // Soft Japanese spring garden background
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "#1c1427");
    bg.addColorStop(0.5, "#2d1b36");
    bg.addColorStop(1, "#401d3a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    for (const petal of this.petals) {
      petal.x += petal.speedX * dt;
      petal.y += petal.speedY * dt;
      petal.rotation += petal.rotationSpeed * dt;
      petal.flip += petal.flipSpeed * dt;

      if (petal.y > h + 20) {
        petal.y = -20;
        petal.x = Math.random() * w;
      }
      if (petal.x > w + 20) {
        petal.x = -20;
      }

      ctx.save();
      ctx.translate(petal.x, petal.y);
      ctx.rotate(petal.rotation);
      ctx.scale(1, Math.cos(petal.flip)); // 3D tumbling flip

      ctx.fillStyle = petal.color;
      ctx.shadowColor = "rgba(244, 114, 182, 0.5)";
      ctx.shadowBlur = 6;

      // Draw delicate sakura petal curve
      ctx.beginPath();
      const s = petal.size;
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-s * 0.5, -s * 0.4, -s * 0.6, -s * 1.1, 0, -s * 1.4);
      ctx.bezierCurveTo(s * 0.6, -s * 1.1, s * 0.5, -s * 0.4, 0, 0);
      ctx.fill();

      ctx.restore();
    }
    ctx.restore();
  }
}

export const globalAnimatedBackground = new AnimatedBackgroundEngine();
