"use client";

import React from "react";
import { ScanFace, Activity, Users, Loader2 } from "lucide-react";
import { useFaceTrackingStore } from "../stores/useFaceTrackingStore";
import { useTranslation } from "@/lib/i18n";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";

interface FaceTrackingControlsProps {
  className?: string;
  compact?: boolean;
}

export const FaceTrackingControls: React.FC<FaceTrackingControlsProps> = ({
  className,
  compact = false,
}) => {
  const {
    isTrackingEnabled,
    isDebugMode,
    status,
    maxFaces,
    detectedFacesCount,
    fps,
    toggleTracking,
    toggleDebugMode,
    setMaxFaces,
  } = useFaceTrackingStore();

  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-md transition-all",
        className
      )}
    >
      {/* 1. Toggle Face Tracking Button */}
      <Tooltip
        content={
          isTrackingEnabled
            ? (t.faceTracking?.disable || "Disable Face Tracking")
            : (t.faceTracking?.enable || "Enable Face Tracking")
        }
      >
        <button
          onClick={toggleTracking}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all",
            isTrackingEnabled
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm shadow-cyan-500/25"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
          aria-label="Toggle Face Tracking"
        >
          {status === "loading" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-200" />
          ) : (
            <ScanFace className="w-3.5 h-3.5" />
          )}
          <span>{t.faceTracking?.title || "Face AI"}</span>

          {isTrackingEnabled && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          )}
        </button>
      </Tooltip>

      {/* 2. Debug Mesh Visualizer Button */}
      {isTrackingEnabled && (
        <Tooltip
          content={
            isDebugMode
              ? (t.faceTracking?.hideDebug || "Hide Debug Mesh")
              : (t.faceTracking?.showDebug || "Show Debug Mesh (Landmarks & 3D Pose)")
          }
        >
          <button
            onClick={toggleDebugMode}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all",
              isDebugMode
                ? "bg-purple-600 text-white font-semibold shadow-sm shadow-purple-500/25"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
            )}
            aria-label="Toggle Debug Mesh"
          >
            <Activity className="w-3.5 h-3.5" />
            {!compact && <span>{t.faceTracking?.debugMesh || "Mesh 3D"}</span>}
          </button>
        </Tooltip>
      )}

      {/* 3. Max Faces Selector */}
      {isTrackingEnabled && !compact && (
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-950/60 px-1.5 py-0.5 rounded-xl border border-zinc-200 dark:border-zinc-800/60">
          <Users className="w-3 h-3 text-zinc-500 dark:text-zinc-400 mr-0.5" />
          {[1, 2, 3, 4].map((count) => (
            <button
              key={count}
              onClick={() => setMaxFaces(count)}
              className={cn(
                "px-1.5 py-0.5 text-[11px] font-medium rounded-md transition-colors",
                maxFaces === count
                  ? "bg-brand-500 text-white font-bold"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              )}
            >
              {count}p
            </button>
          ))}
        </div>
      )}

      {/* 4. Live FPS & Face Count Metric Badge */}
      {isTrackingEnabled && status === "ready" && (
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-[11px] text-zinc-600 dark:text-zinc-300 font-mono">
          <span className="text-emerald-500 font-semibold">{fps} FPS</span>
          <span className="text-zinc-400">•</span>
          <span className="text-cyan-500 font-medium">
            {detectedFacesCount}{" "}
            {detectedFacesCount === 1
              ? (t.faceTracking?.faceSingle || "face")
              : (t.faceTracking?.faceMultiple || "faces")}
          </span>
        </div>
      )}
    </div>
  );
};
