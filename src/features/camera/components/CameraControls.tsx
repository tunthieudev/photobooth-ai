"use client";

import React from "react";
import {
  Camera,
  Timer,
  Layers,
  FlipHorizontal,
  RefreshCw,
  Maximize2,
  Minimize2,
  Settings,
  Square,
  Sparkles,
  XCircle,
  ScanFace,
  Wand2,
  PartyPopper,
  Image as ImageIcon,
} from "lucide-react";
import { useCameraStore, AspectRatioType } from "@/stores/useCameraStore";
import { useBoothStore } from "@/stores/useBoothStore";
import { useFaceTrackingStore } from "@/features/face-tracking";
import { useEffectsStore } from "@/features/effects";
import { useParticleStore } from "@/features/particles";
import { useBackgroundStore } from "@/features/background";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface CameraControlsProps {
  onCapture: () => void;
  onCancelCapture: () => void;
  onOpenSettings: () => void;
  onToggleFilter?: () => void;
  isFilterDrawerOpen?: boolean;
  onToggleFaceTracking?: () => void;
  isFaceDrawerOpen?: boolean;
  onToggleEffects?: () => void;
  isEffectsDrawerOpen?: boolean;
  onToggleParticles?: () => void;
  isParticlesDrawerOpen?: boolean;
  onToggleBackground?: () => void;
  isBackgroundDrawerOpen?: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function CameraControls({
  onCapture,
  onCancelCapture,
  onOpenSettings,
  onToggleFilter,
  isFilterDrawerOpen,
  onToggleFaceTracking,
  isFaceDrawerOpen,
  onToggleEffects,
  isEffectsDrawerOpen,
  onToggleParticles,
  isParticlesDrawerOpen,
  onToggleBackground,
  isBackgroundDrawerOpen,
  isFullscreen,
  onToggleFullscreen,
}: CameraControlsProps) {
  const {
    aspectRatio,
    setAspectRatio,
    countdownDuration,
    setCountdownDuration,
    burstCount,
    setBurstCount,
    isMirrored,
    toggleMirror,
    toggleFacingMode,
    isCapturing,
  } = useCameraStore();

  const { activeFilter, filterIntensity } = useBoothStore();
  const { isTrackingEnabled } = useFaceTrackingStore();
  const { selectedEffectId } = useEffectsStore();
  const { activePreset } = useParticleStore();
  const { isEnabled: hasBackground, mode: bgMode } = useBackgroundStore();
  const { t } = useTranslation();

  const aspectRatios: AspectRatioType[] = ["3:4", "1:1", "4:3", "9:16", "16:9"];
  const countdownDurations: Array<0 | 3 | 5 | 10> = [0, 3, 5, 10];
  const burstCounts: Array<1 | 2 | 3 | 4 | 6 | 8> = [1, 2, 4, 6, 8];

  const hasFilter = activeFilter && activeFilter.id !== "normal" && filterIntensity > 0;
  const hasEffect = selectedEffectId !== null;
  const hasParticles = activePreset !== "none";

  return (
    <div className="w-full flex flex-col items-center gap-4 py-2">
      {/* Top Secondary Controls Bar */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap bg-white dark:bg-zinc-900/90 backdrop-blur-xl p-1.5 sm:p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-md dark:shadow-lg transition-colors">
        {/* Realtime Filters Toggle Button */}
        {onToggleFilter && (
          <button
            onClick={onToggleFilter}
            disabled={isCapturing}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border",
              isFilterDrawerOpen || hasFilter
                ? "bg-brand-500/15 text-brand-600 dark:text-brand-300 border-brand-500/30 shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-950/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800"
            )}
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>{t.booth.cameraStep.filters}</span>
            {hasFilter && (
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            )}
          </button>
        )}

        {/* AR Face Effects Toggle Button (Phase 5) */}
        {onToggleEffects && (
          <button
            onClick={onToggleEffects}
            disabled={isCapturing}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border",
              isEffectsDrawerOpen || hasEffect
                ? "bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30 shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-950/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800"
            )}
          >
            <Wand2 className="w-3.5 h-3.5 text-purple-500" />
            <span>{t.effects?.title || "AR Effects"}</span>
            {hasEffect && (
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            )}
          </button>
        )}

        {/* Animation & Particle Engine Toggle Button (Phase 6) */}
        {onToggleParticles && (
          <button
            onClick={onToggleParticles}
            disabled={isCapturing}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border",
              isParticlesDrawerOpen || hasParticles
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30 shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-950/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800"
            )}
          >
            <PartyPopper className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.particles?.title || "Particles"}</span>
            {hasParticles && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>
        )}

        {/* Background Engine Toggle Button (Phase 7) */}
        {onToggleBackground && (
          <button
            onClick={onToggleBackground}
            disabled={isCapturing}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border",
              isBackgroundDrawerOpen || (hasBackground && bgMode !== "none")
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30 shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-950/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800"
            )}
          >
            <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
            <span>{t.background?.title || "Phông nền"}</span>
            {hasBackground && bgMode !== "none" && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
        )}

        {/* Face AI Tracking Toggle Button */}
        {onToggleFaceTracking && (
          <button
            onClick={onToggleFaceTracking}
            disabled={isCapturing}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border",
              isFaceDrawerOpen || isTrackingEnabled
                ? "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border-cyan-500/30 shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-950/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800"
            )}
          >
            <ScanFace className="w-3.5 h-3.5 text-cyan-500" />
            <span>{t.faceTracking?.title || "Face AI"}</span>
            {isTrackingEnabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
        )}

        {/* Timer Selector */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-950/60 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800/60">
          <Timer className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 ml-1" />
          {countdownDurations.map((duration) => (
            <button
              key={duration}
              onClick={() => setCountdownDuration(duration)}
              disabled={isCapturing}
              className={cn(
                "px-2 py-1 text-xs font-semibold rounded-lg transition-colors",
                countdownDuration === duration
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              )}
            >
              {duration === 0 ? "Off" : `${duration}s`}
            </button>
          ))}
        </div>

        {/* Burst Count Selector */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-950/60 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800/60">
          <Layers className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 ml-1" />
          {burstCounts.map((count) => (
            <button
              key={count}
              onClick={() => setBurstCount(count)}
              disabled={isCapturing}
              className={cn(
                "px-2 py-1 text-xs font-semibold rounded-lg transition-colors",
                burstCount === count
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              )}
            >
              {count}x
            </button>
          ))}
        </div>

        {/* Aspect Ratio Selector */}
        <div className="hidden sm:flex items-center gap-1 bg-zinc-100 dark:bg-zinc-950/60 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800/60">
          <Square className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 ml-1" />
          {aspectRatios.map((ratio) => (
            <button
              key={ratio}
              onClick={() => setAspectRatio(ratio)}
              disabled={isCapturing}
              className={cn(
                "px-2 py-1 text-xs font-medium rounded-lg transition-colors",
                aspectRatio === ratio
                  ? "bg-brand-500 text-white font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              )}
            >
              {ratio}
            </button>
          ))}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <Tooltip content={t.booth.cameraStep.switchCamera}>
            <button
              onClick={toggleFacingMode}
              disabled={isCapturing}
              className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              aria-label={t.booth.cameraStep.switchCamera}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </Tooltip>

          <Tooltip content={t.booth.cameraStep.mirror}>
            <button
              onClick={toggleMirror}
              disabled={isCapturing}
              className={cn(
                "p-2 rounded-xl transition",
                isMirrored
                  ? "bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-500/30"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
              aria-label={t.booth.cameraStep.mirror}
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
          </Tooltip>

          <Tooltip content={t.booth.cameraStep.fullscreen}>
            <button
              onClick={onToggleFullscreen}
              className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              aria-label={t.booth.cameraStep.fullscreen}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </Tooltip>

          <Tooltip content={t.booth.cameraStep.settings}>
            <button
              onClick={onOpenSettings}
              disabled={isCapturing}
              className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              aria-label={t.booth.cameraStep.settings}
            >
              <Settings className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Main Big Capture Trigger Area */}
      <div className="flex items-center justify-center gap-6">
        {isCapturing ? (
          <Button
            variant="danger"
            size="lg"
            onClick={onCancelCapture}
            className="rounded-full h-16 px-8 shadow-xl text-base font-bold animate-pulse"
          >
            <XCircle className="w-6 h-6 mr-2" />
            <span>{t.common.cancel}</span>
          </Button>
        ) : (
          <button
            onClick={onCapture}
            className="group relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-brand-600 via-pink-500 to-purple-600 p-1 shadow-glow hover:scale-105 active:scale-95 transition-all duration-200"
            aria-label={t.booth.cameraStep.burstShoot}
          >
            {/* Outer pulsating ring */}
            <div className="absolute inset-0 rounded-full bg-brand-500/30 animate-ping pointer-events-none group-hover:bg-brand-500/50" />

            {/* Inner button surface */}
            <div className="w-full h-full rounded-full bg-white dark:bg-zinc-950/80 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950/60 border-2 border-white/80 flex items-center justify-center shadow-md transition-colors">
              <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-rose-500 dark:text-white group-hover:scale-110 transition-transform" />
            </div>
          </button>
        )}
      </div>

      {/* Subtext info */}
      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
        {isCapturing
          ? t.booth.cameraStep.capturing
          : `${t.booth.cameraStep.burstCount}: ${burstCount} • ${countdownDuration > 0 ? `${t.booth.cameraStep.timer} ${countdownDuration}s` : "0s"}`}
      </p>
    </div>
  );
}
