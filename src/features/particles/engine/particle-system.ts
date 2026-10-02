import { Particle, ParticleType, ParticleDensity, ParticleSystemContext } from "../types";
import { drawParticle } from "./particle-drawers";

// Confetti palette
const CONFETTI_COLORS = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];

export class ParticleSystem {
  private particles: Particle[] = [];
  private nextId = 1;
  private lastTime = performance.now();
  private lastAmbientSpawnTime = 0;
  private lastExpressionTriggerTimes: Record<string, number> = {};

  // Capacity limits based on density
  private maxParticlesByDensity: Record<ParticleDensity, number> = {
    low: 50,
    medium: 110,
    high: 220,
  };

  /**
   * Clears all particles
   */
  public reset(): void {
    this.particles = [];
  }

  /**
   * Spawns a single particle
   */
  public spawn(p: Omit<Particle, "id" | "age">): void {
    this.particles.push({
      ...p,
      id: this.nextId++,
      age: 0,
    });
  }

  /**
   * Main simulation step: updates physics and spawns ambient & expression particles
   */
  public updateAndRender(
    ctx: CanvasRenderingContext2D,
    context: ParticleSystemContext,
    activePreset: ParticleType | "none",
    density: ParticleDensity,
    expressionTriggersEnabled: boolean
  ): void {
    const { canvasWidth, canvasHeight, isMirrored, timeMs, trackedFaces } = context;
    const deltaMs = Math.min(100, Math.max(1, timeMs - this.lastTime));
    this.lastTime = timeMs;
    const dt = deltaMs / 16.666; // Normalized to 60fps frame delta

    const maxParticles = this.maxParticlesByDensity[density];

    // 1. Ambient Emission (if an active preset is selected)
    if (activePreset !== "none" && this.particles.length < maxParticles) {
      if (timeMs - this.lastAmbientSpawnTime > this.getAmbientSpawnInterval(density)) {
        this.lastAmbientSpawnTime = timeMs;
        this.spawnAmbientParticle(activePreset, canvasWidth, canvasHeight);
      }
    }

    // 2. Facial Expression Triggers
    if (expressionTriggersEnabled && trackedFaces && trackedFaces.length > 0) {
      this.evaluateExpressionTriggers(trackedFaces, canvasWidth, canvasHeight, isMirrored, timeMs);
    }

    // 3. Update physics and remove dead particles
    const alive: Particle[] = [];
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.age += deltaMs;

      if (p.age < p.maxLife) {
        // Physics update
        p.vx += p.ax * dt;
        p.vy += p.ay * dt;

        // Wobble physics (horizontal sway for snow, petals, bubbles)
        if (p.customData?.wobblePhase !== undefined && p.customData?.wobbleSpeed) {
          p.customData.wobblePhase += p.customData.wobbleSpeed * dt;
          p.x += p.vx * dt + Math.sin(p.customData.wobblePhase) * 1.5;
        } else {
          p.x += p.vx * dt;
        }

        p.y += p.vy * dt;
        p.rotation += p.vRot * dt;

        if (p.customData?.flipPhase !== undefined) {
          p.customData.flipPhase += 0.08 * dt;
        }

        // Draw particle
        drawParticle(ctx, p);
        alive.push(p);
      }
    }

    this.particles = alive;
  }

  /**
   * Spawns ambient particles flowing across the screen (snow, flower, bubbles, stars, confetti)
   */
  private spawnAmbientParticle(type: ParticleType, width: number, height: number): void {
    switch (type) {
      case "snow":
        this.spawn({
          type: "snow",
          x: Math.random() * width,
          y: -20,
          vx: (Math.random() - 0.5) * 0.8,
          vy: Math.random() * 1.5 + 1.2,
          ax: 0,
          ay: 0.015,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.03,
          size: Math.random() * 8 + 6,
          scale: 1,
          opacity: Math.random() * 0.35 + 0.65,
          color: "rgba(255, 255, 255, 0.9)",
          maxLife: 9000,
          customData: { wobblePhase: Math.random() * Math.PI, wobbleSpeed: 0.04 },
        });
        break;

      case "flower":
        this.spawn({
          type: "flower",
          x: Math.random() * width,
          y: -20,
          vx: (Math.random() - 0.5) * 1.2,
          vy: Math.random() * 1.6 + 1.2,
          ax: 0,
          ay: 0.015,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.05,
          size: Math.random() * 10 + 10,
          scale: 1,
          opacity: Math.random() * 0.3 + 0.7,
          color: Math.random() > 0.4 ? "#fbcfe8" : "#fda4af",
          maxLife: 8500,
          customData: {
            wobblePhase: Math.random() * Math.PI,
            wobbleSpeed: 0.05,
            flipPhase: Math.random() * Math.PI,
          },
        });
        break;

      case "bubble":
        this.spawn({
          type: "bubble",
          x: Math.random() * width,
          y: height + 20,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -(Math.random() * 1.4 + 0.8),
          ax: 0,
          ay: -0.01,
          rotation: 0,
          vRot: 0,
          size: Math.random() * 14 + 8,
          scale: 1,
          opacity: Math.random() * 0.35 + 0.6,
          color: "rgba(186, 230, 253, 0.7)",
          maxLife: 8000,
          customData: { wobblePhase: Math.random() * Math.PI, wobbleSpeed: 0.03 },
        });
        break;

      case "star":
        this.spawn({
          type: "star",
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -(Math.random() * 0.4 + 0.2),
          ax: 0,
          ay: 0,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.04,
          size: Math.random() * 8 + 6,
          scale: 1,
          opacity: Math.random() * 0.4 + 0.6,
          color: "#fde047",
          maxLife: 3500,
        });
        break;

      case "sparkle":
        this.spawn({
          type: "sparkle",
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -(Math.random() * 0.6 + 0.2),
          ax: 0,
          ay: 0,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.06,
          size: Math.random() * 10 + 6,
          scale: 1,
          opacity: Math.random() * 0.4 + 0.6,
          color: Math.random() > 0.5 ? "#38bdf8" : "#f472b6",
          maxLife: 2500,
        });
        break;

      case "confetti":
        this.spawn({
          type: "confetti",
          x: Math.random() * width,
          y: -15,
          vx: (Math.random() - 0.5) * 2,
          vy: Math.random() * 2 + 1.5,
          ax: 0,
          ay: 0.03,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.1,
          size: Math.random() * 8 + 7,
          scale: 1,
          opacity: 0.95,
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          maxLife: 6000,
          customData: { flipPhase: Math.random() * Math.PI },
        });
        break;

      case "heart":
        this.spawn({
          type: "heart",
          x: Math.random() * width,
          y: height + 10,
          vx: (Math.random() - 0.5) * 1,
          vy: -(Math.random() * 1.6 + 1),
          ax: 0,
          ay: -0.015,
          rotation: (Math.random() - 0.5) * 0.4,
          vRot: (Math.random() - 0.5) * 0.02,
          size: Math.random() * 12 + 8,
          scale: 1,
          opacity: 0.85,
          color: Math.random() > 0.5 ? "#f43f5e" : "#ec4899",
          maxLife: 5000,
          customData: { wobblePhase: Math.random() * Math.PI, wobbleSpeed: 0.04 },
        });
        break;

      case "butterfly":
        this.spawn({
          type: "butterfly",
          x: Math.random() > 0.5 ? -15 : width + 15,
          y: Math.random() * height * 0.8,
          vx: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 1.2 + 0.8),
          vy: (Math.random() - 0.5) * 1,
          ax: 0,
          ay: 0,
          rotation: 0,
          vRot: 0,
          size: Math.random() * 10 + 8,
          scale: 1,
          opacity: 0.9,
          color: Math.random() > 0.5 ? "#c084fc" : "#818cf8",
          maxLife: 7000,
          customData: { wobblePhase: Math.random() * Math.PI, wobbleSpeed: 0.15 },
        });
        break;
    }
  }

  /**
   * Realtime Expression Detection & Interactive Bursts
   */
  private evaluateExpressionTriggers(
    faces: any[],
    width: number,
    height: number,
    isMirrored: boolean,
    timeMs: number
  ): void {
    const mapPt = (normX: number, normY: number) => ({
      x: isMirrored ? (1 - normX) * width : normX * width,
      y: normY * height,
    });

    for (let f = 0; f < faces.length; f++) {
      const face = faces[f];
      const faceKey = `face_${f}`;

      // 1. SMILE -> Burst floating hearts from cheeks!
      if (face.expressions.isSmiling) {
        const lastSmile = this.lastExpressionTriggerTimes[`${faceKey}_smile`] || 0;
        if (timeMs - lastSmile > 220) {
          this.lastExpressionTriggerTimes[`${faceKey}_smile`] = timeMs;
          const cheek = Math.random() > 0.5 ? face.keypoints.leftCheek : face.keypoints.rightCheek;
          const pt = mapPt(cheek.x, cheek.y);

          this.spawn({
            type: "heart",
            x: pt.x + (Math.random() - 0.5) * 20,
            y: pt.y + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 2,
            vy: -(Math.random() * 2.5 + 2),
            ax: 0,
            ay: -0.02,
            rotation: (Math.random() - 0.5) * 0.5,
            vRot: (Math.random() - 0.5) * 0.04,
            size: Math.random() * 12 + 10,
            scale: 1,
            opacity: 0.95,
            color: Math.random() > 0.5 ? "#fb7185" : "#f43f5e",
            maxLife: 2200,
            customData: { wobblePhase: Math.random() * Math.PI, wobbleSpeed: 0.08 },
          });
        }
      }

      // 2. BLINK / WINK -> Burst sparkles around eyes!
      if (face.expressions.isBlinking || face.expressions.isWinkLeft || face.expressions.isWinkRight) {
        const lastBlink = this.lastExpressionTriggerTimes[`${faceKey}_blink`] || 0;
        if (timeMs - lastBlink > 250) {
          this.lastExpressionTriggerTimes[`${faceKey}_blink`] = timeMs;
          const eye = face.expressions.isWinkLeft
            ? face.keypoints.leftEye
            : face.expressions.isWinkRight
            ? face.keypoints.rightEye
            : Math.random() > 0.5
            ? face.keypoints.leftEye
            : face.keypoints.rightEye;
          const pt = mapPt(eye.x, eye.y);

          for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = Math.random() * 2.5 + 1.5;
            this.spawn({
              type: "sparkle",
              x: pt.x,
              y: pt.y,
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd,
              ax: 0,
              ay: 0.02,
              rotation: Math.random() * Math.PI * 2,
              vRot: (Math.random() - 0.5) * 0.08,
              size: Math.random() * 9 + 7,
              scale: 1,
              opacity: 0.95,
              color: Math.random() > 0.4 ? "#facc15" : "#38bdf8",
              maxLife: 1400,
            });
          }
        }
      }

      // 3. MOUTH OPEN -> Erupt fire embers from mouth!
      if (face.expressions.isMouthOpen) {
        const lastMouth = this.lastExpressionTriggerTimes[`${faceKey}_mouth`] || 0;
        if (timeMs - lastMouth > 120) {
          this.lastExpressionTriggerTimes[`${faceKey}_mouth`] = timeMs;
          const pt = mapPt(face.keypoints.mouthCenter.x, face.keypoints.mouthCenter.y);

          for (let i = 0; i < 3; i++) {
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.9;
            const spd = Math.random() * 3 + 2.5;

            this.spawn({
              type: "fire",
              x: pt.x + (Math.random() - 0.5) * 12,
              y: pt.y,
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd,
              ax: 0,
              ay: -0.04, // Updraft
              rotation: 0,
              vRot: 0,
              size: Math.random() * 12 + 10,
              scale: 1,
              opacity: 0.9,
              color: "#f97316",
              maxLife: 1500,
            });
          }
        }
      }
    }
  }

  private getAmbientSpawnInterval(density: ParticleDensity): number {
    switch (density) {
      case "low":
        return 220;
      case "medium":
        return 120;
      case "high":
        return 65;
    }
  }

  /**
   * Renders the current particle snapshot onto a static capture canvas
   */
  public renderSnapshot(
    ctx: CanvasRenderingContext2D,
    targetWidth: number,
    targetHeight: number,
    sourceWidth: number,
    sourceHeight: number
  ): void {
    if (this.particles.length === 0) return;
    const scaleX = targetWidth / sourceWidth;
    const scaleY = targetHeight / sourceHeight;

    ctx.save();
    for (const p of this.particles) {
      const cloned = {
        ...p,
        x: p.x * scaleX,
        y: p.y * scaleY,
        scale: p.scale * Math.min(scaleX, scaleY),
      };
      drawParticle(ctx, cloned);
    }
    ctx.restore();
  }
}

// Global Singleton Particle System instance
export const globalParticleSystem = new ParticleSystem();
