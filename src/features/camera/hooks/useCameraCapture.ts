"use client";

import { useState, useCallback, useRef } from "react";
import { useCameraStore } from "@/stores/useCameraStore";
import { useBoothStore, CapturedShot } from "@/stores/useBoothStore";
import { getComputedFilterCSS, getOverlaySettings } from "@/features/filters/utils/filter-css";
import { soundEngine } from "../utils/sound";
import { useEffectsStore, getEffectById, renderAREffectsToCanvas, adjustFaceForCrop } from "@/features/effects";
import { globalParticleSystem } from "@/features/particles";
import { useBackgroundStore, renderBackgroundLayer, compositeSegmentedPerson, globalSegmentationPipeline } from "@/features/background";
import { TrackedFace } from "@/features/face-tracking/types";

export function useCameraCapture(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  trackedFacesRef?: React.RefObject<TrackedFace[]>
) {
  const {
    countdownDuration,
    burstCount,
    isMirrored,
    aspectRatio,
    setIsCapturing,
    setIsCountingDown,
    setCountdownCurrent,
  } = useCameraStore();

  const {
    addCapturedShot,
    setCapturedShots,
    setCurrentStep,
    activeFilter,
    filterIntensity,
  } = useBoothStore();

  const [currentShotIndex, setCurrentShotIndex] = useState<number>(0);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [activeCountdownNumber, setActiveCountdownNumber] = useState<number | null>(null);

  const isCancelledRef = useRef<boolean>(false);

  // Capture single high quality frame from video element with active filter
  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;

    const canvas = document.createElement("canvas");
    const videoWidth = video.videoWidth || 1280;
    const videoHeight = video.videoHeight || 720;

    // Determine target canvas dimensions based on aspect ratio
    let targetWidth = videoWidth;
    let targetHeight = videoHeight;

    const [rw, rh] = aspectRatio.split(":").map(Number);
    const targetAspect = rw / rh;
    const videoAspect = videoWidth / videoHeight;

    let sx = 0;
    let sy = 0;
    let sWidth = videoWidth;
    let sHeight = videoHeight;

    if (videoAspect > targetAspect) {
      // Video is wider than target -> crop sides
      sWidth = videoHeight * targetAspect;
      sx = (videoWidth - sWidth) / 2;
    } else {
      // Video is taller than target -> crop top/bottom
      sHeight = videoWidth / targetAspect;
      sy = (videoHeight - sHeight) / 2;
    }

    targetWidth = sWidth;
    targetHeight = sHeight;

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;

    // Apply mirror if enabled
    if (isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    // Apply active CSS filter to Canvas 2D context
    const filterCSS = getComputedFilterCSS(activeFilter, filterIntensity);
    if (filterCSS && filterCSS !== "none") {
      ctx.filter = filterCSS;
    }

    // Draw Video Feed or Background Segmentation Layer (Phase 7)
    const bgStore = useBackgroundStore.getState();
    if (bgStore.isEnabled && bgStore.mode !== "none") {
      renderBackgroundLayer(ctx, video, targetWidth, targetHeight, bgStore, false);
      const mask = globalSegmentationPipeline.generateFallbackMask(targetWidth, targetHeight);
      if (mask) {
        compositeSegmentedPerson(ctx, video, mask, targetWidth, targetHeight, false, bgStore.edgeSoftness);
      }
    } else {
      ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
    }
    ctx.filter = "none";

    // Apply Vignette if filter has vignette
    const overlay = getOverlaySettings(activeFilter, filterIntensity);
    if (overlay.vignetteOpacity > 0) {
      ctx.save();
      const radius = Math.max(targetWidth, targetHeight) * 0.75;
      const grad = ctx.createRadialGradient(
        targetWidth / 2,
        targetHeight / 2,
        radius * 0.4,
        targetWidth / 2,
        targetHeight / 2,
        radius
      );
      grad.addColorStop(0, "rgba(0, 0, 0, 0)");
      grad.addColorStop(1, `rgba(0, 0, 0, ${overlay.vignetteOpacity})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      ctx.restore();
    }

    // Apply Active AR Face Effect onto captured photo
    const { selectedEffectId, intensity: effectIntensity } = useEffectsStore.getState();
    const effect = getEffectById(selectedEffectId);
    const faces = trackedFacesRef?.current || [];
    if (effect && faces.length > 0) {
      const croppedFaces = faces.map((f) =>
        adjustFaceForCrop(f, sx, sy, sWidth, sHeight, videoWidth, videoHeight)
      );
      renderAREffectsToCanvas({
        ctx,
        faces: croppedFaces,
        effect,
        width: targetWidth,
        height: targetHeight,
        isMirrored,
        intensity: effectIntensity,
      });
    }

    // Apply Active Animation & Particle Engine snapshot onto captured photo
    globalParticleSystem.renderSnapshot(ctx, targetWidth, targetHeight, videoWidth, videoHeight);

    return canvas.toDataURL("image/jpeg", 0.95);
  }, [activeFilter, aspectRatio, filterIntensity, isMirrored, videoRef, trackedFacesRef]);

  // Execute countdown for a single shot
  const runSingleCountdown = useCallback(
    (duration: number): Promise<void> => {
      return new Promise((resolve) => {
        if (duration <= 0) {
          resolve();
          return;
        }

        let current = duration;
        setActiveCountdownNumber(current);
        setCountdownCurrent(current);
        soundEngine.playCountdownTick(false);

        const interval = setInterval(() => {
          if (isCancelledRef.current) {
            clearInterval(interval);
            resolve();
            return;
          }

          current -= 1;
          if (current > 0) {
            setActiveCountdownNumber(current);
            setCountdownCurrent(current);
            soundEngine.playCountdownTick(false);
          } else {
            clearInterval(interval);
            setActiveCountdownNumber(null);
            soundEngine.playCountdownTick(true);
            resolve();
          }
        }, 1000);
      });
    },
    [setCountdownCurrent]
  );

  // Trigger white screen shutter flash
  const triggerFlash = useCallback(() => {
    setIsFlashing(true);
    soundEngine.playShutterSound();
    setTimeout(() => {
      setIsFlashing(false);
    }, 250);
  }, []);

  // Start complete burst capture flow
  const startBurstCapture = useCallback(async () => {
    isCancelledRef.current = false;
    setIsCapturing(true);
    setIsCountingDown(true);
    setCapturedShots([]); // Reset previous session shots

    const shots: CapturedShot[] = [];
    const totalShots = burstCount;

    for (let i = 0; i < totalShots; i++) {
      if (isCancelledRef.current) break;

      setCurrentShotIndex(i + 1);

      // 1. Run countdown before photo
      await runSingleCountdown(countdownDuration);

      if (isCancelledRef.current) break;

      // 2. Trigger Flash & Shutter
      triggerFlash();

      // 3. Grab frame with active filter
      const dataUrl = captureFrame();
      if (dataUrl) {
        const shot: CapturedShot = {
          id: `shot-${Date.now()}-${i + 1}`,
          dataUrl,
          timestamp: Date.now(),
        };
        shots.push(shot);
        addCapturedShot(shot);
      }

      // 4. Brief pause between burst shots if more shots remain
      if (i < totalShots - 1 && !isCancelledRef.current) {
        await new Promise((r) => setTimeout(r, 800));
      }
    }

    setIsCapturing(false);
    setIsCountingDown(false);
    setActiveCountdownNumber(null);

    if (!isCancelledRef.current && shots.length > 0) {
      soundEngine.playCompleteChime();
      // Move to shot selection step
      setCurrentStep("select");
    }
  }, [
    addCapturedShot,
    burstCount,
    captureFrame,
    countdownDuration,
    runSingleCountdown,
    setCapturedShots,
    setCurrentStep,
    setIsCapturing,
    setIsCountingDown,
    triggerFlash,
  ]);

  // Cancel in-flight capture
  const cancelCapture = useCallback(() => {
    isCancelledRef.current = true;
    setIsCapturing(false);
    setIsCountingDown(false);
    setActiveCountdownNumber(null);
  }, [setIsCapturing, setIsCountingDown]);

  return {
    isFlashing,
    activeCountdownNumber,
    currentShotIndex,
    totalShots: burstCount,
    startBurstCapture,
    cancelCapture,
  };
}
