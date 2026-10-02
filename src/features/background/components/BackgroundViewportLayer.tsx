"use client";

import React, { useEffect, useRef, useState } from "react";
import { useBackgroundStore } from "../stores/useBackgroundStore";
import { useCameraStore } from "@/stores/useCameraStore";
import { getSelfieSegmenter, globalSegmentationPipeline } from "../services/segmenter";
import { renderBackgroundLayer, compositeSegmentedPerson } from "../renderers/background-compositor";
import { preloadAllPresetImages } from "../services/image-loader";

interface BackgroundViewportLayerProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export const BackgroundViewportLayer: React.FC<BackgroundViewportLayerProps> = ({ videoRef }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const segmenterRef = useRef<any>(null);
  const lastMaskRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  const {
    isEnabled,
    mode,
    blurLevel,
    blurRadius,
    selectedColor,
    selectedImageId,
    selectedAnimatedId,
    customMedia,
    opacity,
    edgeSoftness,
    setModelLoading,
    setHasModelLoaded,
  } = useBackgroundStore();

  const isMirrored = useCameraStore((s) => s.isMirrored);
  const [modelStatus, setModelStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  // Preload preset images on initial mount
  useEffect(() => {
    preloadAllPresetImages();
  }, []);

  // Initialize MediaPipe Image Segmenter
  useEffect(() => {
    if (!isEnabled || mode === "none") return;

    let isMounted = true;
    setModelLoading(true);
    setModelStatus("loading");

    getSelfieSegmenter()
      .then((seg) => {
        if (!isMounted) return;
        if (seg) {
          segmenterRef.current = seg;
          setModelStatus("ready");
          setHasModelLoaded(true);
        } else {
          setModelStatus("error");
        }
      })
      .catch((err) => {
        console.error("Segmenter load error:", err);
        if (isMounted) setModelStatus("error");
      })
      .finally(() => {
        if (isMounted) setModelLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isEnabled, mode, setModelLoading, setHasModelLoaded]);

  // Main 60 FPS Render Loop
  useEffect(() => {
    if (!isEnabled || mode === "none") {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let isRunning = true;

    const renderLoop = (time: number) => {
      if (!isRunning) return;

      const video = videoRef?.current;
      const deltaTime = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;

      if (video && video.readyState >= 2 && video.videoWidth > 0) {
        const vw = video.videoWidth;
        const vh = video.videoHeight;

        // Resize canvas to match live video resolution
        if (canvas.width !== vw || canvas.height !== vh) {
          canvas.width = vw;
          canvas.height = vh;
        }

        // Process segmentation if segmenter is loaded
        if (segmenterRef.current) {
          globalSegmentationPipeline.processVideoFrame(
            video,
            time,
            segmenterRef.current,
            (res) => {
              lastMaskRef.current = res.maskCanvas;
            }
          );
        }

        ctx.clearRect(0, 0, vw, vh);

        const currentSettings = {
          isEnabled,
          mode,
          blurLevel,
          blurRadius,
          selectedColor,
          selectedImageId,
          selectedAnimatedId,
          customMedia,
          opacity,
          edgeSoftness,
        };

        // 1. Draw the chosen background layer
        renderBackgroundLayer(ctx, video, vw, vh, currentSettings, isMirrored, deltaTime);

        // 2. Composite the segmented person on top
        const maskCanvas =
          lastMaskRef.current || globalSegmentationPipeline.generateFallbackMask(vw, vh);

        if (maskCanvas) {
          compositeSegmentedPerson(ctx, video, maskCanvas, vw, vh, isMirrored, edgeSoftness);
        }
      }

      animationFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animationFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    };
  }, [
    isEnabled,
    mode,
    blurLevel,
    blurRadius,
    selectedColor,
    selectedImageId,
    selectedAnimatedId,
    customMedia,
    opacity,
    edgeSoftness,
    isMirrored,
    videoRef,
  ]);

  if (!isEnabled || mode === "none") {
    return null;
  }

  return (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
      {/* Realtime Composited Person & Background Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover select-none"
      />

      {/* Subtle indicator when AI segmentation model is downloading on first run */}
      {modelStatus === "loading" && (
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-xs text-white shadow-lg animate-pulse">
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping" />
          <span>Starting AI Person Segmentation...</span>
        </div>
      )}
    </div>
  );
};
