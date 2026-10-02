"use client";

import { useEffect, useRef, useCallback } from "react";
import { TrackedFace } from "../types";
import { getFaceLandmarker, processFaceLandmarks } from "../services/face-landmarker";
import { useFaceTrackingStore } from "../stores/useFaceTrackingStore";

interface UseFaceTrackingOptions {
  onFacesUpdate?: (faces: TrackedFace[]) => void;
  enabled?: boolean;
}

export function useFaceTracking(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  options: UseFaceTrackingOptions = {}
) {
  const {
    isTrackingEnabled,
    isDebugMode,
    status,
    errorMessage,
    maxFaces,
    detectedFacesCount,
    fps,
    setTrackingEnabled,
    toggleTracking,
    setIsDebugMode,
    toggleDebugMode,
    setStatus,
    setErrorMessage,
    setStats,
  } = useFaceTrackingStore();

  const enabled = options.enabled !== undefined ? options.enabled : isTrackingEnabled;

  // Storing tracked faces in a mutable ref to allow 60fps reads without React re-renders
  const trackedFacesRef = useRef<TrackedFace[]>([]);
  const animFrameIdRef = useRef<number | null>(null);
  const landmarkerRef = useRef<any>(null);
  const isDestroyedRef = useRef(false);

  // Performance & FPS tracking refs
  const lastVideoTimeRef = useRef<number>(-1);
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateTimeRef = useRef<number>(performance.now());
  const calculatedFpsRef = useRef<number>(0);

  // Initialize MediaPipe landmarker
  useEffect(() => {
    if (!enabled) {
      setStatus("disabled");
      return;
    }

    isDestroyedRef.current = false;
    let isCancelled = false;

    async function init() {
      try {
        setStatus("loading");
        const landmarker = await getFaceLandmarker(maxFaces);
        if (isCancelled || isDestroyedRef.current) return;
        landmarkerRef.current = landmarker;
        setStatus("ready");
      } catch (err: any) {
        if (isCancelled) return;
        console.error("Face landmarker initialization failed:", err);
        setErrorMessage(err?.message || "Failed to load face tracking engine");
      }
    }

    init();

    return () => {
      isCancelled = true;
    };
  }, [enabled, maxFaces, setStatus, setErrorMessage]);

  // Main tracking loop
  const onFacesUpdateRef = useRef(options.onFacesUpdate);
  useEffect(() => {
    onFacesUpdateRef.current = options.onFacesUpdate;
  }, [options.onFacesUpdate]);

  const loop = useCallback(() => {
    if (isDestroyedRef.current || !enabled) return;

    const video = videoRef.current;
    const landmarker = landmarkerRef.current;

    if (
      video &&
      landmarker &&
      video.readyState >= 2 &&
      !video.paused &&
      !video.ended &&
      video.videoWidth > 0 &&
      video.videoHeight > 0
    ) {
      const currentTime = video.currentTime;

      // Only perform landmark detection when a new video frame has arrived
      if (currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = currentTime;

        try {
          const startTimeMs = performance.now();
          const results = landmarker.detectForVideo(video, startTimeMs);

          const faces = processFaceLandmarks(
            results,
            video.videoWidth,
            video.videoHeight
          );

          trackedFacesRef.current = faces;
          onFacesUpdateRef.current?.(faces);

          // Calculate FPS
          frameCountRef.current++;
          const now = performance.now();
          const elapsed = now - lastFpsUpdateTimeRef.current;

          if (elapsed >= 500) {
            calculatedFpsRef.current = Math.round(
              (frameCountRef.current * 1000) / elapsed
            );
            frameCountRef.current = 0;
            lastFpsUpdateTimeRef.current = now;

            // Throttled update to zustand store for UI indicators
            setStats(faces.length, calculatedFpsRef.current);
          }
        } catch (detectionErr) {
          // Non-fatal frame error (e.g. slight timing collision on stream change)
          console.debug("Face tracking frame skip:", detectionErr);
        }
      }
    }

    animFrameIdRef.current = requestAnimationFrame(loop);
  }, [enabled, videoRef, setStats]);

  useEffect(() => {
    if (status === "ready" && enabled) {
      animFrameIdRef.current = requestAnimationFrame(loop);
    }

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [status, enabled, loop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isDestroyedRef.current = true;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  return {
    status,
    errorMessage,
    isTrackingEnabled,
    isDebugMode,
    detectedFacesCount,
    fps,
    trackedFacesRef,
    setTrackingEnabled,
    toggleTracking,
    setIsDebugMode,
    toggleDebugMode,
  };
}
