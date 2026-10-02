"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useCameraStore } from "@/stores/useCameraStore";
import { useBoothStore } from "@/stores/useBoothStore";

export interface CameraResolution {
  label: string;
  width: number;
  height: number;
}

export const RESOLUTION_PRESETS: CameraResolution[] = [
  { label: "Full HD (1080p)", width: 1920, height: 1080 },
  { label: "HD (720p)", width: 1280, height: 720 },
  { label: "Standard (480p)", width: 640, height: 480 },
];

export function useCameraStream() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const {
    selectedDeviceId,
    facingMode,
    isMirrored,
    hasPermission,
    permissionError,
    setHasPermission,
    setPermissionError,
    setSelectedDeviceId,
    setAvailableDevices,
    setIsStreaming,
  } = useCameraStore();

  const { currentStep } = useBoothStore();

  const [selectedResolution, setSelectedResolution] = useState<CameraResolution>(RESOLUTION_PRESETS[0]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actualResolution, setActualResolution] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  // Attach stream to video element
  const attachStreamToVideo = useCallback((mediaStream: MediaStream | null) => {
    if (videoRef.current && mediaStream) {
      if (videoRef.current.srcObject !== mediaStream) {
        videoRef.current.srcObject = mediaStream;
      }
      videoRef.current.play().catch(() => {});
      setActualResolution({
        width: videoRef.current.videoWidth || 1280,
        height: videoRef.current.videoHeight || 720,
      });
    }
  }, []);

  // Enumerate video input devices
  const refreshDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");
      setAvailableDevices(videoDevices);

      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.warn("Could not enumerate devices:", err);
    }
  }, [selectedDeviceId, setAvailableDevices, setSelectedDeviceId]);

  // Start camera stream
  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setPermissionError(null);

    // Stop previous tracks if exists
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasPermission(false);
      setPermissionError("Camera API is not supported in this browser. Please use Chrome, Safari, or Edge.");
      setIsLoading(false);
      return;
    }

    const videoConstraints: MediaTrackConstraints = {
      width: { ideal: selectedResolution.width },
      height: { ideal: selectedResolution.height },
    };

    if (selectedDeviceId) {
      videoConstraints.deviceId = { exact: selectedDeviceId };
    } else {
      videoConstraints.facingMode = facingMode;
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false,
      });

      streamRef.current = newStream;
      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(() => {});
            setActualResolution({
              width: videoRef.current.videoWidth,
              height: videoRef.current.videoHeight,
            });
          }
        };
      }

      setHasPermission(true);
      setIsStreaming(true);
      setIsLoading(false);
      await refreshDevices();
    } catch (err: any) {
      console.error("Camera access error:", err);
      setIsLoading(false);
      setIsStreaming(false);
      setHasPermission(false);

      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setPermissionError("Camera permission was denied. Please allow camera access in your browser settings.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setPermissionError("No camera found. Please connect a webcam or enable your device camera.");
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        setPermissionError("Camera is currently in use by another application. Please close other apps and try again.");
      } else if (err.name === "OverconstrainedError") {
        // Fallback to basic constraint
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          streamRef.current = fallbackStream;
          setStream(fallbackStream);
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            videoRef.current.play().catch(() => {});
          }
          setHasPermission(true);
          setIsStreaming(true);
        } catch {
          setPermissionError("Could not start camera with requested settings.");
        }
      } else {
        setPermissionError(err.message || "Failed to access camera.");
      }
    }
  }, [
    facingMode,
    refreshDevices,
    selectedDeviceId,
    selectedResolution,
    setHasPermission,
    setIsStreaming,
    setPermissionError,
  ]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, [setIsStreaming]);

  // Handle hardware device changes (connect/disconnect)
  useEffect(() => {
    const handleDeviceChange = () => {
      refreshDevices();
    };

    navigator.mediaDevices?.addEventListener("devicechange", handleDeviceChange);
    return () => {
      navigator.mediaDevices?.removeEventListener("devicechange", handleDeviceChange);
    };
  }, [refreshDevices]);

  // Re-start camera when parameters change or when entering camera step
  useEffect(() => {
    if (currentStep === "camera") {
      startCamera();
    }
    return () => {
      if (currentStep !== "camera") {
        stopCamera();
      }
    };
  }, [currentStep, facingMode, selectedDeviceId, selectedResolution, startCamera, stopCamera]);

  return {
    videoRef,
    streamRef,
    stream,
    isLoading,
    hasPermission,
    permissionError,
    actualResolution,
    selectedResolution,
    setSelectedResolution,
    isMirrored,
    startCamera,
    stopCamera,
    attachStreamToVideo,
    refreshDevices,
  };
}
