"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  SlidersHorizontal,
  LayoutGrid,
  Camera,
  Layers,
  Palette,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  useCameraStream,
  useCameraCapture,
  CameraViewport,
  CameraControls,
  BurstStripPreview,
  CameraSettingsModal,
  CameraErrorBanner,
} from "@/features/camera";
import {
  LayoutSelector,
  FrameCustomizer,
  PhotoboothCanvas,
  SlotAssigner,
  ResultView,
  renderPhotoboothStrip,
} from "@/features/photobooth";
import { FilterSelector } from "@/features/filters";
import { FaceTrackingControls, useFaceTracking } from "@/features/face-tracking";
import { EffectSelector } from "@/features/effects";
import { ParticleSelector } from "@/features/particles";
import { BackgroundSelector } from "@/features/background";
import { useBoothStore, BoothStep } from "@/stores/useBoothStore";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/lib/i18n";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { cn } from "@/lib/utils";

export default function BoothPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isFaceDrawerOpen, setIsFaceDrawerOpen] = useState(false);
  const [isEffectsDrawerOpen, setIsEffectsDrawerOpen] = useState(false);
  const [isParticlesDrawerOpen, setIsParticlesDrawerOpen] = useState(false);
  const [isBackgroundDrawerOpen, setIsBackgroundDrawerOpen] = useState(false);

  const { t } = useTranslation();

  const {
    currentStep,
    setCurrentStep,
    selectedLayout,
    slotAssignments,
    frameSettings,
    finalResultUrl,
    setFinalResultUrl,
    isGeneratingResult,
    setIsGeneratingResult,
    resetBooth,
  } = useBoothStore();

  const toast = useToast();

  const {
    videoRef,
    stream,
    isLoading,
    permissionError,
    actualResolution,
    selectedResolution,
    setSelectedResolution,
    startCamera,
  } = useCameraStream();

  // Face Tracking Engine (shared across viewport and photo snapshot)
  const { trackedFacesRef } = useFaceTracking(videoRef);

  const {
    isFlashing,
    activeCountdownNumber,
    currentShotIndex,
    totalShots,
    startBurstCapture,
    cancelCapture,
  } = useCameraCapture(videoRef, trackedFacesRef);

  // Toggle Fullscreen
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Generate high-resolution final strip
  const handleGenerateResult = async () => {
    setIsGeneratingResult(true);
    try {
      const resultDataUrl = await renderPhotoboothStrip({
        layout: selectedLayout,
        slotAssignments,
        frameSettings,
        scale: 2.5, // 2.5x high-res export
      });
      setFinalResultUrl(resultDataUrl);
      setCurrentStep("result");
      toast.success("Photobooth strip rendered in high definition!");
    } catch (err: any) {
      console.error("Render failed:", err);
      toast.error("Failed to render strip. Please try again.");
    } finally {
      setIsGeneratingResult(false);
    }
  };

  const steps: Array<{ id: BoothStep; label: string; icon: React.ReactNode }> = [
    { id: "layout", label: t.booth.steps.layout, icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { id: "camera", label: t.booth.steps.camera, icon: <Camera className="w-3.5 h-3.5" /> },
    { id: "select", label: t.booth.steps.select, icon: <Layers className="w-3.5 h-3.5" /> },
    { id: "customize", label: t.booth.steps.customize, icon: <Palette className="w-3.5 h-3.5" /> },
    { id: "result", label: t.booth.steps.result, icon: <Sparkles className="w-3.5 h-3.5" /> },
  ];

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex-1 flex flex-col w-full bg-background text-foreground transition-colors duration-200",
        isFullscreen ? "h-screen p-4" : "p-3 sm:p-6 max-w-7xl mx-auto"
      )}
    >
      {/* Top Header Navigation Bar with Steps Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 border-b border-zinc-200 dark:border-zinc-800/80 gap-3">
        {/* Left: Back button & Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/">
            <button className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
                {t.booth.title}
              </h1>
              <Badge variant="pro" className="text-[10px]">
                {selectedLayout.name}
              </Badge>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {currentStep === "layout" && t.booth.stepDesc.layout}
              {currentStep === "camera" && t.booth.stepDesc.camera}
              {currentStep === "select" && t.booth.stepDesc.select}
              {currentStep === "customize" && t.booth.stepDesc.customize}
              {currentStep === "result" && t.booth.stepDesc.result}
            </p>
          </div>
        </div>

        {/* Center: Step Navigation Indicator */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-950/80 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 overflow-x-auto no-scrollbar">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => {
                  // Only allow navigation if reached
                  if (step.id === "layout" || step.id === "camera") {
                    setCurrentStep(step.id);
                  } else if (
                    (step.id === "select" || step.id === "customize") &&
                    Object.keys(slotAssignments).length > 0
                  ) {
                    setCurrentStep(step.id);
                  }
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap",
                  isActive
                    ? "bg-brand-500 text-white font-semibold shadow-glow"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                )}
              >
                {step.icon}
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Language & Camera Settings if in Camera mode */}
        <div className="flex items-center gap-2">
          <LanguageToggle />
          {currentStep === "camera" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              leftIcon={<SlidersHorizontal className="w-4 h-4" />}
            >
              {t.booth.cameraStep.settings}
            </Button>
          )}
        </div>
      </div>

      {/* Main Multi-Step Content Body */}
      <div className="flex-1 flex flex-col justify-center my-auto py-4">
        {/* STEP 1: Layout Selection */}
        {currentStep === "layout" && (
          <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
            <div className="text-center max-w-xl mx-auto mb-2">
              <h2 className="text-2xl font-bold text-white">{t.booth.layoutStep.title}</h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                {t.booth.layoutStep.subtitle}
              </p>
            </div>

            <LayoutSelector />

            <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
              <div className="text-xs text-zinc-400">
                {t.booth.layoutStep.selected}: <strong className="text-white">{selectedLayout.name}</strong> (
                {selectedLayout.slots.length} {t.booth.layoutStep.cuts})
              </div>
              <Button
                variant="studio"
                size="lg"
                onClick={() => setCurrentStep("camera")}
                className="shadow-glow"
              >
                <Camera className="w-5 h-5 mr-2" />
                <span dangerouslySetInnerHTML={{ __html: t.booth.layoutStep.enterCamera }} />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Live Camera Studio with Realtime Filters */}
        {currentStep === "camera" && (
          <div className="flex flex-col gap-2">
            {permissionError ? (
              <CameraErrorBanner error={permissionError} onRetry={startCamera} />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start w-full">
                {/* Left/Center: Camera Viewport, Realtime Filters Dock & Shutter Controls */}
                <div className="lg:col-span-8 flex flex-col items-center justify-center gap-2 max-w-2xl mx-auto w-full">
                  {/* Live Camera Viewport */}
                  <CameraViewport
                    videoRef={videoRef}
                    stream={stream}
                    isLoading={isLoading}
                    isFlashing={isFlashing}
                    countdownNumber={activeCountdownNumber}
                    currentShotIndex={currentShotIndex}
                    totalShots={totalShots}
                    trackedFacesRef={trackedFacesRef}
                  />

                  {/* Realtime Filters Reel Dock (Directly visible beneath camera for instant feedback) */}
                  {isFilterDrawerOpen && (
                    <div className="w-full animate-in fade-in-50 duration-200">
                      <FilterSelector />
                    </div>
                  )}

                  {/* AR Face Effects Reel Dock (Phase 5) */}
                  {isEffectsDrawerOpen && (
                    <div className="w-full animate-in fade-in-50 duration-200">
                      <EffectSelector />
                    </div>
                  )}

                  {/* Animation & Particle Engine Reel Dock (Phase 6) */}
                  {isParticlesDrawerOpen && (
                    <div className="w-full animate-in fade-in-50 duration-200">
                      <ParticleSelector />
                    </div>
                  )}

                  {/* Background Engine Reel Dock (Phase 7) */}
                  {isBackgroundDrawerOpen && (
                    <div className="w-full animate-in fade-in-50 duration-200">
                      <BackgroundSelector />
                    </div>
                  )}

                  {/* Face Tracking Controls Dock */}
                  {isFaceDrawerOpen && (
                    <div className="w-full flex justify-center animate-in fade-in-50 duration-200">
                      <FaceTrackingControls />
                    </div>
                  )}

                  {/* Primary & Secondary Camera Controls */}
                  <CameraControls
                    onCapture={startBurstCapture}
                    onCancelCapture={cancelCapture}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    onToggleFilter={() => {
                      setIsFilterDrawerOpen(!isFilterDrawerOpen);
                      if (!isFilterDrawerOpen) {
                        setIsEffectsDrawerOpen(false);
                        setIsParticlesDrawerOpen(false);
                        setIsBackgroundDrawerOpen(false);
                        setIsFaceDrawerOpen(false);
                      }
                    }}
                    isFilterDrawerOpen={isFilterDrawerOpen}
                    onToggleEffects={() => {
                      setIsEffectsDrawerOpen(!isEffectsDrawerOpen);
                      if (!isEffectsDrawerOpen) {
                        setIsFilterDrawerOpen(false);
                        setIsParticlesDrawerOpen(false);
                        setIsBackgroundDrawerOpen(false);
                        setIsFaceDrawerOpen(false);
                      }
                    }}
                    isEffectsDrawerOpen={isEffectsDrawerOpen}
                    onToggleParticles={() => {
                      setIsParticlesDrawerOpen(!isParticlesDrawerOpen);
                      if (!isParticlesDrawerOpen) {
                        setIsFilterDrawerOpen(false);
                        setIsEffectsDrawerOpen(false);
                        setIsBackgroundDrawerOpen(false);
                        setIsFaceDrawerOpen(false);
                      }
                    }}
                    isParticlesDrawerOpen={isParticlesDrawerOpen}
                    onToggleBackground={() => {
                      setIsBackgroundDrawerOpen(!isBackgroundDrawerOpen);
                      if (!isBackgroundDrawerOpen) {
                        setIsFilterDrawerOpen(false);
                        setIsEffectsDrawerOpen(false);
                        setIsParticlesDrawerOpen(false);
                        setIsFaceDrawerOpen(false);
                      }
                    }}
                    isBackgroundDrawerOpen={isBackgroundDrawerOpen}
                    onToggleFaceTracking={() => {
                      setIsFaceDrawerOpen(!isFaceDrawerOpen);
                      if (!isFaceDrawerOpen) {
                        setIsFilterDrawerOpen(false);
                        setIsEffectsDrawerOpen(false);
                        setIsParticlesDrawerOpen(false);
                        setIsBackgroundDrawerOpen(false);
                      }
                    }}
                    isFaceDrawerOpen={isFaceDrawerOpen}
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={toggleFullscreen}
                  />
                </div>

                {/* Right: Realtime Strip Preview (Desktop & Tablet) */}
                <div className="hidden lg:block lg:col-span-4 h-full sticky top-4">
                  <BurstStripPreview />
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Photo Selection & Slot Assignment */}
        {currentStep === "select" && (
          <SlotAssigner
            onContinue={() => setCurrentStep("customize")}
            onRetake={() => {
              resetBooth();
              setCurrentStep("camera");
            }}
          />
        )}

        {/* STEP 4: Frame & Background Customization */}
        {currentStep === "customize" && (
          <div className="w-full flex flex-col lg:flex-row gap-8 items-start justify-center max-w-6xl mx-auto">
            {/* Left: Realtime Strip Preview Canvas */}
            <div className="w-full lg:w-1/2 flex flex-col items-center">
              <div className="flex items-center justify-between w-full max-w-sm mb-3 px-2">
                <span className="text-xs font-semibold text-zinc-300">Live Custom Strip</span>
                <Badge variant="brand">{selectedLayout.name}</Badge>
              </div>

              <PhotoboothCanvas interactive={false} />
            </div>

            {/* Right: Customization Controls Panel */}
            <div className="w-full lg:w-1/2 flex flex-col gap-6">
              <FrameCustomizer />

              <div className="flex items-center justify-between gap-3 pt-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setCurrentStep("select")}
                >
                  &larr; Back to Photos
                </Button>

                <Button
                  variant="studio"
                  size="lg"
                  onClick={handleGenerateResult}
                  isLoading={isGeneratingResult}
                  className="shadow-glow"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span>Generate Final Strip &rarr;</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Final Result Display */}
        {currentStep === "result" && finalResultUrl && (
          <ResultView
            resultUrl={finalResultUrl}
            onRetake={() => {
              resetBooth();
              setCurrentStep("layout");
            }}
          />
        )}
      </div>

      {/* Camera Settings Modal */}
      <CameraSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedResolution={selectedResolution}
        onSelectResolution={setSelectedResolution}
        actualResolution={actualResolution}
      />
    </div>
  );
}
