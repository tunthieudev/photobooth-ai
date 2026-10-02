"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useEffectsStore } from "../stores/useEffectsStore";
import { AR_EFFECTS, getEffectById } from "../data/effects-registry";
import { EffectCategory } from "../types";
import { Slider } from "@/components/ui/Slider";
import { Sliders, RotateCcw, Check, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface EffectSelectorProps {
  onClose?: () => void;
}

export function EffectSelector({ onClose: _onClose }: EffectSelectorProps) {
  const {
    selectedEffectId,
    setSelectedEffectId,
    selectedCategory,
    setSelectedCategory,
    intensity,
    setIntensity,
  } = useEffectsStore();

  const { language } = useTranslation();
  const [showIntensity, setShowIntensity] = useState(false);

  // Horizontal reel scrolling & dragging refs
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const categories: Array<{ id: EffectCategory; label: string }> = [
    { id: "all", label: language === "vi" ? "Tất cả" : "All" },
    { id: "animal", label: language === "vi" ? "Động vật" : "Animals" },
    { id: "accessories", label: language === "vi" ? "Phụ kiện" : "Accessories" },
    { id: "beauty", label: language === "vi" ? "Làm đẹp" : "Beauty" },
    { id: "funny", label: language === "vi" ? "Hài hước" : "Funny" },
  ];

  const filteredEffects = AR_EFFECTS.filter(
    (eff) => selectedCategory === "all" || eff.category === selectedCategory
  );

  const activeEffect = getEffectById(selectedEffectId);

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
  }, [updateScrollButtons, filteredEffects]);

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
          {selectedEffectId && (
            <>
              <button
                onClick={() => setShowIntensity(!showIntensity)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition",
                  showIntensity
                    ? "bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-500/30"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
                aria-label="Adjust effect intensity"
              >
                <Sliders className="w-3 h-3" />
                <span className="text-[11px] font-mono">{intensity}%</span>
              </button>

              <button
                onClick={() => setSelectedEffectId(null)}
                className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                title={language === "vi" ? "Tắt hiệu ứng" : "Remove effect"}
                aria-label="Remove effect"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Expandable Intensity Slider */}
      {showIntensity && selectedEffectId && (
        <div className="flex items-center gap-3 px-2 py-1 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in-50 duration-150">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium whitespace-nowrap">
            {language === "vi" ? "Độ đậm nhạt" : "Intensity"}
          </span>
          <div className="flex-1">
            <Slider
              min={10}
              max={100}
              step={1}
              value={intensity}
              onChange={setIntensity}
            />
          </div>
          <span className="text-xs font-mono font-bold text-brand-500 dark:text-brand-400 w-9 text-right">
            {intensity}%
          </span>
        </div>
      )}

      {/* Interactive Trigger Hint Banner if active */}
      {activeEffect && (activeEffect.interactiveHint || activeEffect.interactiveHintVi) && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/10 via-pink-500/10 to-purple-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 animate-in fade-in duration-150">
          <Zap className="w-3 h-3 text-amber-500 animate-bounce flex-shrink-0" />
          <span className="font-medium text-[11px]">
            {language === "vi"
              ? activeEffect.interactiveHintVi || activeEffect.interactiveHint
              : activeEffect.interactiveHint}
          </span>
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

        {/* Effects Horizontal Reel with Wheel + Drag-to-scroll */}
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={cn(
            "flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scroll-smooth select-none cursor-grab active:cursor-grabbing",
            // Custom subtle scrollbar
            "[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-zinc-100 dark:[&::-webkit-scrollbar-track]:bg-zinc-800/50 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-400"
          )}
        >
          {/* None / Reset Option */}
          <button
            onClick={() => {
              if (!hasDraggedRef.current) setSelectedEffectId(null);
            }}
            className={cn(
              "flex flex-col items-center justify-center min-w-[70px] sm:min-w-[76px] h-20 rounded-2xl border-2 transition-all duration-150 p-1 flex-shrink-0 group",
              !selectedEffectId
                ? "border-brand-500 bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 shadow-sm"
                : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            )}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-zinc-200/80 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 group-hover:scale-105 transition-transform mb-1">
              <RotateCcw className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold tracking-tight truncate w-full text-center">
              {language === "vi" ? "Tự nhiên" : "None"}
            </span>
          </button>

          {/* Registered Effect Cards */}
          {filteredEffects.map((eff) => {
            const isSelected = selectedEffectId === eff.id;
            const name = language === "vi" ? eff.nameVi : eff.name;

            return (
              <button
                key={eff.id}
                onClick={() => {
                  if (!hasDraggedRef.current) setSelectedEffectId(eff.id);
                }}
                className={cn(
                  "relative flex flex-col items-center justify-center min-w-[70px] sm:min-w-[76px] h-20 rounded-2xl border-2 transition-all duration-150 p-1 flex-shrink-0 group",
                  isSelected
                    ? "border-brand-500 bg-brand-500/10 dark:bg-brand-500/20 shadow-md shadow-brand-500/20 scale-[1.02]"
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 hover:border-brand-500/50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
              >
                {/* Active check pill */}
                {isSelected && (
                  <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-brand-500 text-white flex items-center justify-center shadow">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}

                {/* Emoji Icon Preview */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700/80 text-xl group-hover:scale-110 transition-transform mb-1 pointer-events-none">
                  {eff.icon}
                </div>

                {/* Title */}
                <span
                  className={cn(
                    "text-[11px] tracking-tight truncate w-full text-center pointer-events-none",
                    isSelected
                      ? "font-bold text-brand-600 dark:text-brand-400"
                      : "font-medium text-zinc-700 dark:text-zinc-300"
                  )}
                >
                  {name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
