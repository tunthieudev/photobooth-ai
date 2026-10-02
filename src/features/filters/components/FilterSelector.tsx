"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useBoothStore } from "@/stores/useBoothStore";
import { FILTER_PRESETS } from "../constants/filters";
import { FilterCategory } from "../types";
import { Slider } from "@/components/ui/Slider";
import { Button } from "@/components/ui/Button";
import { Eye, RotateCcw, Check, Sliders, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface FilterSelectorProps {
  onClose?: () => void;
  compact?: boolean;
}

export function FilterSelector({ compact: _compact = false }: FilterSelectorProps) {
  const {
    activeFilter,
    setActiveFilter,
    filterIntensity,
    setFilterIntensity,
  } = useBoothStore();

  const { t } = useTranslation();

  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("all");
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [showIntensity, setShowIntensity] = useState<boolean>(false);

  // Horizontal reel scrolling & dragging refs
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const categories: Array<{ id: FilterCategory; label: string }> = [
    { id: "all", label: t.booth.filters.all },
    { id: "korean", label: t.booth.filters.korean },
    { id: "film", label: t.booth.filters.film },
    { id: "basic", label: t.booth.filters.basic },
    { id: "cinematic", label: t.booth.filters.cinematic },
    { id: "cute", label: t.booth.filters.cute },
    { id: "bw", label: t.booth.filters.bw },
  ];

  const filteredPresets = FILTER_PRESETS.filter(
    (f) => selectedCategory === "all" || f.category === selectedCategory || f.id === "normal"
  );

  const isFilterActive = activeFilter && activeFilter.id !== "normal" && filterIntensity > 0;

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
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [updateScrollButtons, filteredPresets]);

  // Click scroll left / right
  const handleScroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const offset = dir === "left" ? -220 : 220;
    el.scrollBy({ left: offset, behavior: "smooth" });
  };

  // Mouse wheel horizontal scroll conversion
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    if (e.deltaY !== 0) {
      el.scrollLeft += e.deltaY;
    }
  };

  // Mouse drag-to-scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    setIsDragging(true);
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    const el = scrollRef.current;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current);
    if (Math.abs(walk) > 4) {
      hasDraggedRef.current = true;
    }
    el.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="w-full flex flex-col gap-2 bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-2.5 sm:p-3 shadow-md dark:shadow-xl backdrop-blur-xl transition-all">
      {/* Top Header: Categories & Quick Intensity Toggle */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        {/* Category Pills */}
        <div className="flex items-center gap-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-2.5 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150",
                selectedCategory === cat.id
                  ? "bg-brand-500 text-white font-semibold shadow-sm shadow-brand-500/30"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Action icons (Intensity & Clear) */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isFilterActive && (
            <>
              <button
                onClick={() => setShowIntensity(!showIntensity)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition",
                  showIntensity
                    ? "bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-500/30"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
                aria-label="Adjust intensity"
              >
                <Sliders className="w-3 h-3" />
                <span className="text-[11px] font-mono">{filterIntensity}%</span>
              </button>

              <button
                onClick={() => {
                  const normal = FILTER_PRESETS.find((f) => f.id === "normal");
                  if (normal) setActiveFilter(normal);
                }}
                className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                title={t.booth.filters.reset}
                aria-label={t.booth.filters.reset}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Floating/Collapsible Intensity Slider & Compare Bar */}
      {showIntensity && isFilterActive && (
        <div className="flex items-center gap-3 py-1.5 px-3 bg-zinc-50 dark:bg-zinc-950/80 rounded-xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in-50 duration-200">
          <div className="flex-1">
            <Slider
              label={`${t.booth.filters.intensity} (${activeFilter.name})`}
              min={0}
              max={100}
              step={2}
              value={filterIntensity}
              onChange={setFilterIntensity}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onMouseDown={() => setIsComparing(true)}
            onMouseUp={() => setIsComparing(false)}
            onTouchStart={() => setIsComparing(true)}
            onTouchEnd={() => setIsComparing(false)}
            className={cn(
              "text-[11px] shrink-0 h-7 px-2",
              isComparing && "bg-brand-500 text-white"
            )}
            title={t.booth.filters.holdCompare}
          >
            <Eye className="w-3 h-3 mr-1" />
            <span>{isComparing ? t.booth.filters.original : t.booth.filters.holdCompare}</span>
          </Button>
        </div>
      )}

      {/* Relative container with Left/Right navigation arrows */}
      <div className="relative group/reel w-full">
        {/* Left Arrow Button */}
        {canScrollLeft && (
          <button
            onClick={() => handleScroll("left")}
            className="absolute -left-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/95 dark:bg-zinc-800/95 border border-zinc-200 dark:border-zinc-700 shadow-md flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:scale-110 active:scale-95 transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Right Arrow Button */}
        {canScrollRight && (
          <button
            onClick={() => handleScroll("right")}
            className="absolute -right-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/95 dark:bg-zinc-800/95 border border-zinc-200 dark:border-zinc-700 shadow-md flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:scale-110 active:scale-95 transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Single-Row Horizontal Carousel Swatches with Wheel + Drag-to-scroll */}
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={cn(
            "flex items-center gap-2 overflow-x-auto py-1.5 px-0.5 scroll-smooth select-none cursor-grab active:cursor-grabbing",
            // Custom subtle scrollbar
            "[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-zinc-100 dark:[&::-webkit-scrollbar-track]:bg-zinc-800/50 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-400"
          )}
        >
          {filteredPresets.map((preset) => {
            const isSelected =
              (!activeFilter && preset.id === "normal") ||
              activeFilter?.id === preset.id;

            return (
              <button
                key={preset.id}
                onClick={() => {
                  if (!hasDraggedRef.current) {
                    setActiveFilter(preset);
                    if (filterIntensity === 0) setFilterIntensity(80);
                  }
                }}
                className={cn(
                  "group relative flex flex-col items-center gap-1 p-1 rounded-xl transition-all duration-200 shrink-0",
                  isSelected
                    ? "scale-105"
                    : "opacity-80 hover:opacity-100 hover:scale-102"
                )}
              >
                {/* Swatch Icon Circle */}
                <div
                  style={{ background: preset.previewGradient }}
                  className={cn(
                    "w-11 h-11 sm:w-12 sm:h-12 rounded-2xl shadow-md flex items-center justify-center relative overflow-hidden transition-all duration-200 border-2 pointer-events-none",
                    isSelected
                      ? "border-brand-500 ring-2 ring-brand-500/50 shadow-glow"
                      : "border-zinc-200 dark:border-zinc-700/80 group-hover:border-zinc-400 dark:group-hover:border-zinc-500"
                  )}
                >
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>

                <span
                  className={cn(
                    "text-[10px] font-semibold truncate max-w-[58px] text-center pointer-events-none",
                    isSelected
                      ? "text-brand-600 dark:text-brand-300 font-bold"
                      : "text-zinc-700 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200"
                  )}
                >
                  {preset.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
