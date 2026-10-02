"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCameraStore } from "@/stores/useCameraStore";
import { useBoothStore } from "@/stores/useBoothStore";
import { getComputedFilterCSS, getOverlaySettings } from "@/features/filters/utils/filter-css";
import { FilterOverlayLayer } from "@/features/filters/components/FilterOverlayLayer";
import { cn } from "@/lib/utils";
import { Loader2, ScanFace } from "lucide-react";
import { useFaceTracking, FaceTrackingOverlay } from "@/features/face-tracking";
import { AREffectsOverlay, useEffectsStore, getEffectById } from "@/features/effects";
import { ParticleOverlay, useParticleStore, PARTICLE_PRESETS } from "@/features/particles";
import { BackgroundViewportLayer, useBackgroundStore, PRESET_IMAGES, ANIMATED_PRESETS } from "@/features/background";
import { TrackedFace } from "@/features/face-tracking/types";

interface CameraViewportProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream?: MediaStream | null;
  isLoading: boolean;
  isFlashing: boolean;
  countdownNumber: number | null;
  currentShotIndex: number;
  totalShots: number;
  trackedFacesRef?: React.RefObject<TrackedFace[]>;
}

export function CameraViewport({
  videoRef,
  stream,
  isLoading,
  isFlashing,
  countdownNumber,
  currentShotIndex,
  totalShots,
  trackedFacesRef: externalTrackedFacesRef,
}: CameraViewportProps) {
  const { aspectRatio, isMirrored, isCapturing } = useCameraStore();
  const { activeFilter, filterIntensity } = useBoothStore();
  const { selectedEffectId } = useEffectsStore();
  const { activePreset } = useParticleStore();
  const { isEnabled: isBgEnabled, mode: bgMode, selectedImageId, selectedAnimatedId, blurLevel } = useBackgroundStore();
  const activeEffect = getEffectById(selectedEffectId);
  const activeParticleItem = PARTICLE_PRESETS.find((p) => p.id === activePreset);
  const activeBgImage = PRESET_IMAGES.find((p) => p.id === selectedImageId);
  const activeBgAnim = ANIMATED_PRESETS.find((p) => p.id === selectedAnimatedId);

  // Face Tracking Engine (Phase 4)
  const internalFaceTracking = useFaceTracking(videoRef, {
    enabled: !externalTrackedFacesRef,
  });

  const trackedFacesRef = externalTrackedFacesRef || internalFaceTracking.trackedFacesRef;
  const faceStatus = internalFaceTracking.status;
  const isTrackingEnabled = internalFaceTracking.isTrackingEnabled;
  const fps = internalFaceTracking.fps;
  const detectedFacesCount = internalFaceTracking.detectedFacesCount;

  // Ensure stream is bound to video element on mount/update
  useEffect(() => {
    const video = videoRef.current;
    if (video && stream) {
      if (video.srcObject !== stream) {
        video.srcObject = stream;
      }
      video.play().catch(() => {});
    }
  }, [stream, videoRef]);

  const aspectClassMap = {
    "1:1": "aspect-[1/1] max-w-[380px] max-h-[42vh]",
    "4:3": "aspect-[4/3] max-w-[480px] max-h-[42vh]",
    "3:4": "aspect-[3/4] max-w-[340px] max-h-[44vh]",
    "16:9": "aspect-[16/9] max-w-[560px] max-h-[40vh]",
    "9:16": "aspect-[9/16] max-w-[280px] max-h-[44vh]",
  };

  // Compute live CSS filter & overlays
  const computedFilterCSS = getComputedFilterCSS(activeFilter, filterIntensity);
  const overlaySettings = getOverlaySettings(activeFilter, filterIntensity);

  return (
    <div className="relative w-full flex items-center justify-center overflow-hidden p-2 sm:p-4">
      {/* Aspect ratio frame container */}
      <div
        className={cn(
          "relative w-full mx-auto bg-black rounded-3xl overflow-hidden shadow-2xl border-2 border-zinc-800/80 transition-all duration-300 flex items-center justify-center",
          aspectClassMap[aspectRatio]
        )}
      >
        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-md text-zinc-300">
            <Loader2 className="w-10 h-10 animate-spin text-brand-500 mb-3" />
            <p className="text-sm font-medium">Starting camera...</p>
          </div>
        )}

        {/* Live Video Feed with Realtime Filter Applied */}
        <video
          ref={videoRef as any}
          autoPlay
          playsInline
          muted
          style={{
            filter: computedFilterCSS,
          }}
          className={cn(
            "w-full h-full object-cover select-none pointer-events-none transition-transform duration-200",
            isMirrored && "scale-x-[-1]"
          )}
        />

        {/* Background Engine Person Segmentation & Replacement Layer (Phase 7) */}
        <BackgroundViewportLayer videoRef={videoRef} />

        {/* Face Tracking Canvas Overlay (Phase 4) */}
        <FaceTrackingOverlay
          videoRef={videoRef}
          trackedFacesRef={trackedFacesRef}
        />

        {/* AR Face Effects Overlay (Phase 5) */}
        <AREffectsOverlay
          videoRef={videoRef}
          trackedFacesRef={trackedFacesRef}
        />

        {/* Animation & Particle Engine Overlay (Phase 6) */}
        <ParticleOverlay
          videoRef={videoRef}
          trackedFacesRef={trackedFacesRef}
        />

        {/* Realtime Film Grain, Vignette & Light Leak Overlays */}
        <FilterOverlayLayer
          grainOpacity={overlaySettings.grainOpacity}
          vignetteOpacity={overlaySettings.vignetteOpacity}
          showLightLeak={overlaySettings.showLightLeak}
        />

        {/* Active Filter, AR Effect, Particle & Background Pill Badges */}
        <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-1.5 pointer-events-none">
          {activeFilter && activeFilter.id !== "normal" && (
            <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-brand-300 shadow-md">
              ✦ {activeFilter.name} ({filterIntensity}%)
            </div>
          )}
          {activeEffect && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-950/80 backdrop-blur-md border border-purple-500/40 text-[11px] font-semibold text-purple-200 shadow-md">
              <span>{activeEffect.icon}</span>
              <span>{activeEffect.nameVi || activeEffect.name}</span>
            </div>
          )}
          {activeParticleItem && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/80 backdrop-blur-md border border-amber-500/40 text-[11px] font-semibold text-amber-200 shadow-md">
              <span>{activeParticleItem.icon}</span>
              <span>{activeParticleItem.nameVi || activeParticleItem.name}</span>
            </div>
          )}
          {isBgEnabled && bgMode !== "none" && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-[11px] font-semibold text-emerald-200 shadow-md">
              <span>🖼️</span>
              <span>
                {bgMode === "blur"
                  ? `Mờ (${blurLevel})`
                  : bgMode === "image"
                  ? activeBgImage?.name || "Cảnh nền"
                  : bgMode === "animated"
                  ? activeBgAnim?.name || "Nền động"
                  : bgMode === "color"
                  ? "Màu nền"
                  : "Nền riêng"}
              </span>
            </div>
          )}
        </div>

        {/* Face Tracking Debug Info Badge (Top-Left) */}
        {isTrackingEnabled && (
          <div className="absolute top-4 left-4 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[11px] font-medium text-white shadow-md">
            <ScanFace className="w-3.5 h-3.5 text-cyan-400" />
            {faceStatus === "loading" && (
              <span className="text-zinc-300 animate-pulse">Loading AI...</span>
            )}
            {faceStatus === "ready" && (
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-emerald-400 font-semibold">{fps} FPS</span>
                {detectedFacesCount > 0 && (
                  <>
                    <span className="text-zinc-500">•</span>
                    <span className="text-cyan-300">
                      {detectedFacesCount} {detectedFacesCount === 1 ? "face" : "faces"}
                    </span>
                  </>
                )}
              </div>
            )}
            {faceStatus === "error" && (
              <span className="text-rose-400">AI Offline</span>
            )}
          </div>
        )}

        {/* Top Floating Badge during Burst */}
        {isCapturing && (
          <div className="absolute top-12 left-4 z-30 flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 backdrop-blur-md border border-white/20 text-xs font-semibold text-white shadow-lg">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>
              Shot {currentShotIndex} of {totalShots}
            </span>
          </div>
        )}

        {/* Shutter White Flash Effect */}
        <AnimatePresence>
          {isFlashing && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute inset-0 z-40 bg-white pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Countdown Animation Overlay */}
        <AnimatePresence mode="wait">
          {countdownNumber !== null && (
            <motion.div
              key={countdownNumber}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1.15, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
            >
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-black/50 backdrop-blur-lg border-2 border-white/40 flex items-center justify-center shadow-glow">
                <span className="text-6xl sm:text-7xl font-black bg-gradient-to-br from-white via-pink-200 to-brand-400 bg-clip-text text-transparent font-mono">
                  {countdownNumber}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Corner Viewfinder Aesthetic Grid */}
        <div className="absolute inset-0 pointer-events-none border border-white/10 rounded-3xl z-20">
          {/* Top-left bracket */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white/40 rounded-tl-lg" />
          {/* Top-right bracket */}
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white/40 rounded-tr-lg" />
          {/* Bottom-left bracket */}
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white/40 rounded-bl-lg" />
          {/* Bottom-right bracket */}
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white/40 rounded-br-lg" />

          {/* Center focus indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border border-white/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
