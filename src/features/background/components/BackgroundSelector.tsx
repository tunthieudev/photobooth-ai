"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useBackgroundStore } from "../stores/useBackgroundStore";
import {
  BLUR_OPTIONS,
  COLOR_PRESETS,
  PRESET_IMAGES,
  ANIMATED_PRESETS,
} from "../data/presets";
import { Slider } from "@/components/ui/Slider";
import {
  Sliders,
  Check,
  ChevronLeft,
  ChevronRight,
  Upload,
  Loader2,
  Sparkles,
  Palette,
  Image as ImageIcon,
  CloudRain,
  EyeOff,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type TabType = "blur" | "color" | "preset" | "animated" | "custom";

export function BackgroundSelector() {
  const {
    isEnabled,
    mode,
    blurLevel,
    selectedColor,
    selectedImageId,
    selectedAnimatedId,
    customMedia,
    edgeSoftness,
    isUploading,
    setEnabled,
    setMode,
    setBlurLevel,
    setColor,
    setImageId,
    setAnimatedId,
    setCustomMedia,
    setEdgeSoftness,
    setUploading,
    reset,
  } = useBackgroundStore();

  const { language } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>(
    mode === "color"
      ? "color"
      : mode === "image"
      ? "preset"
      : mode === "animated"
      ? "animated"
      : mode === "video"
      ? "custom"
      : "blur"
  );
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Horizontal reel scrolling & dragging refs
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    {
      id: "blur",
      label: language === "vi" ? "Làm mờ" : "Blur",
      icon: <Sparkles className="w-3.5 h-3.5" />,
    },
    {
      id: "color",
      label: language === "vi" ? "Màu sắc" : "Colors",
      icon: <Palette className="w-3.5 h-3.5" />,
    },
    {
      id: "preset",
      label: language === "vi" ? "Cảnh đẹp (10)" : "Presets (10)",
      icon: <ImageIcon className="w-3.5 h-3.5" />,
    },
    {
      id: "animated",
      label: language === "vi" ? "Động (6)" : "Animated (6)",
      icon: <CloudRain className="w-3.5 h-3.5" />,
    },
    {
      id: "custom",
      label: language === "vi" ? "Tải lên" : "Upload",
      icon: <Upload className="w-3.5 h-3.5" />,
    },
  ];

  // Check scroll boundary visibility
  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
        updateScrollButtons();
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [activeTab, updateScrollButtons]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    setIsDragging(true);
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const el = scrollRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    if (Math.abs(walk) > 5) {
      hasDraggedRef.current = true;
    }
    el.scrollLeft = scrollLeftRef.current - walk;
    updateScrollButtons();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const scrollByAmount = (offset: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: offset, behavior: "smooth" });
    setTimeout(updateScrollButtons, 250);
  };

  // Custom background file upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const localUrl = URL.createObjectURL(file);

    // 1. Immediately apply local blob preview
    setCustomMedia({
      url: localUrl,
      type: isVideo ? "video" : "image",
      name: file.name,
      size: file.size,
    });
    setMode(isVideo ? "video" : "image");
    setEnabled(true);

    // 2. Upload to Cloudinary in background
    try {
      setUploading(true);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const res = await fetch("/api/backgrounds/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mediaBase64: base64,
              fileName: file.name,
              mediaType: isVideo ? "video" : "image",
            }),
          });
          const data = await res.json();
          if (data.success && data.url) {
            setCustomMedia({
              url: data.url,
              type: isVideo ? "video" : "image",
              name: file.name,
              publicId: data.publicId,
            });
          }
        } catch (err) {
          console.warn("Background upload to Cloudinary failed, using local object URL:", err);
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setUploading(false);
    }
  };

  return (
    <div className="w-full bg-white/95 dark:bg-zinc-950/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-xl p-3 sm:p-4 flex flex-col gap-3 transition-colors select-none">
      {/* Top Header: Category Tabs + Reset & Controls Toggle */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-1">
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === "blur" && mode !== "blur") setMode("blur");
                if (tab.id === "color" && mode !== "color") setMode("color");
                if (tab.id === "preset" && mode !== "image") setMode("image");
                if (tab.id === "animated" && mode !== "animated") setMode("animated");
              }}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-white dark:bg-zinc-800 text-brand-600 dark:text-brand-400 shadow-xs font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isEnabled && (
            <button
              onClick={() => reset()}
              title={language === "vi" ? "Tắt phông nền" : "Turn off background"}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>{language === "vi" ? "Tắt nền" : "Disable"}</span>
            </button>
          )}

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              "p-1.5 rounded-lg border text-xs font-medium transition-colors",
              showSettings
                ? "bg-brand-500/10 text-brand-500 border-brand-500/30"
                : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            )}
            title={language === "vi" ? "Chỉnh viền & độ mờ" : "Settings"}
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Edge Softness & Fine Settings Drawer */}
      {showSettings && (
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800/80 flex flex-col gap-2.5 text-xs animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-300 font-medium">
            <span>{language === "vi" ? "Độ mềm viền cắt (Feathering)" : "Edge Softness"}</span>
            <span className="font-mono text-brand-500 font-semibold">{edgeSoftness}px</span>
          </div>
          <Slider
            min={0}
            max={12}
            step={1}
            value={edgeSoftness}
            onChange={(val) => setEdgeSoftness(val)}
            unit="px"
            showValue={false}
          />
        </div>
      )}

      {/* Main Content Area with Navigation Arrows */}
      <div className="relative group/reel">
        {/* Left Arrow Button */}
        {canScrollLeft && (
          <button
            onClick={() => scrollByAmount(-220)}
            className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white dark:bg-zinc-900 shadow-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:scale-105 active:scale-95 transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Horizontal Reel Container */}
        <div
          ref={scrollRef}
          onScroll={updateScrollButtons}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={cn(
            "flex items-center gap-3 overflow-x-auto py-1 px-1 scroll-smooth select-none cursor-grab active:cursor-grabbing",
            "scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent"
          )}
        >
          {/* TAB 1: BLUR PRESETS */}
          {activeTab === "blur" && (
            <>
              {BLUR_OPTIONS.map((opt) => {
                const isSelected = isEnabled && mode === "blur" && blurLevel === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      if (hasDraggedRef.current) return;
                      setBlurLevel(opt.id);
                    }}
                    className={cn(
                      "shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 transition-all p-2 gap-1.5 relative overflow-hidden group",
                      isSelected
                        ? "border-brand-500 bg-brand-500/10 shadow-md ring-2 ring-brand-500/20"
                        : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
                    )}
                  >
                    {/* Simulated Blur Bubble Preview */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-xs relative">
                      <div
                        className="absolute inset-0 rounded-full bg-white/40"
                        style={{ filter: `blur(${Math.min(opt.radius / 3, 8)}px)` }}
                      />
                      <Sparkles className="w-4 h-4 relative z-10" />
                    </div>

                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {opt.label}
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      {opt.radius}px
                    </span>

                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px]">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </>
          )}

          {/* TAB 2: COLOR PRESETS */}
          {activeTab === "color" && (
            <>
              {COLOR_PRESETS.map((color) => {
                const isSelected = isEnabled && mode === "color" && selectedColor === color.value;
                return (
                  <button
                    key={color.id}
                    onClick={() => {
                      if (hasDraggedRef.current) return;
                      setColor(color.value);
                    }}
                    className={cn(
                      "shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 transition-all p-2 gap-1.5 relative overflow-hidden group",
                      isSelected
                        ? "border-brand-500 shadow-md ring-2 ring-brand-500/20"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                    )}
                  >
                    {/* Color Swatch Circle */}
                    <div
                      className="w-10 h-10 rounded-full border border-black/10 dark:border-white/20 shadow-sm"
                      style={{ background: color.value }}
                    />
                    <span className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 text-center line-clamp-1">
                      {color.name}
                    </span>

                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px]">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </>
          )}

          {/* TAB 3: PHOTO PRESETS (10 Required) */}
          {activeTab === "preset" && (
            <>
              {PRESET_IMAGES.map((preset) => {
                const isSelected = isEnabled && mode === "image" && selectedImageId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      if (hasDraggedRef.current) return;
                      setImageId(preset.id);
                    }}
                    className={cn(
                      "shrink-0 flex flex-col items-center justify-between w-28 h-28 rounded-2xl border-2 transition-all p-2 relative overflow-hidden group",
                      isSelected
                        ? "border-brand-500 shadow-lg ring-2 ring-brand-500/30 scale-102"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:scale-101"
                    )}
                    style={{ background: preset.thumbnailGradient }}
                  >
                    {/* Subtle Overlay Badge */}
                    <div className="w-full flex items-center justify-between z-10">
                      <span className="px-1.5 py-0.5 rounded-md bg-black/50 backdrop-blur-xs text-[9px] font-semibold text-white/90 uppercase tracking-wider">
                        {preset.category}
                      </span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px] shadow-sm">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    {/* Preset Name */}
                    <div className="w-full z-10 text-left bg-black/60 backdrop-blur-xs p-1 rounded-lg">
                      <div className="text-xs font-bold text-white line-clamp-1">{preset.name}</div>
                    </div>
                  </button>
                );
              })}
            </>
          )}

          {/* TAB 4: ANIMATED BACKGROUNDS (6 Required) */}
          {activeTab === "animated" && (
            <>
              {ANIMATED_PRESETS.map((anim) => {
                const isSelected =
                  isEnabled && mode === "animated" && selectedAnimatedId === anim.id;
                return (
                  <button
                    key={anim.id}
                    onClick={() => {
                      if (hasDraggedRef.current) return;
                      setAnimatedId(anim.id);
                    }}
                    className={cn(
                      "shrink-0 flex flex-col items-center justify-center w-28 h-24 rounded-2xl border-2 transition-all p-2.5 gap-1.5 relative overflow-hidden group",
                      isSelected
                        ? "border-brand-500 bg-brand-500/15 shadow-md ring-2 ring-brand-500/20"
                        : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
                    )}
                  >
                    <span className="text-2xl group-hover:scale-115 transition-transform">
                      {anim.icon}
                    </span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 text-center line-clamp-1">
                      {anim.name}
                    </span>

                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px]">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </>
          )}

          {/* TAB 5: CUSTOM UPLOAD */}
          {activeTab === "custom" && (
            <div className="flex items-center gap-3 w-full py-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="shrink-0 flex flex-col items-center justify-center w-36 h-24 rounded-2xl border-2 border-dashed border-brand-500/60 hover:border-brand-500 bg-brand-500/5 hover:bg-brand-500/10 transition-all p-2 gap-1.5 cursor-pointer text-brand-600 dark:text-brand-400"
              >
                {isUploading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
                <span className="text-xs font-semibold">
                  {isUploading
                    ? language === "vi"
                      ? "Đang tải lên..."
                      : "Uploading..."
                    : language === "vi"
                    ? "Chọn ảnh / video"
                    : "Choose media"}
                </span>
                <span className="text-[10px] text-zinc-500">JPG, PNG, WebP, MP4</span>
              </button>

              {customMedia && (
                <div className="flex flex-col items-start gap-1 p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-1">
                    {customMedia.name}
                  </span>
                  <span className="text-[11px] text-brand-500 font-medium capitalize">
                    {customMedia.type} {customMedia.publicId ? "• Cloudinary" : "• Local"}
                  </span>
                  <button
                    onClick={() => {
                      setCustomMedia(null);
                      setMode("blur");
                    }}
                    className="text-[10px] text-rose-500 hover:underline mt-1"
                  >
                    {language === "vi" ? "Gỡ bỏ" : "Remove"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Arrow Button */}
        {canScrollRight && (
          <button
            onClick={() => scrollByAmount(220)}
            className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white dark:bg-zinc-900 shadow-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:scale-105 active:scale-95 transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
