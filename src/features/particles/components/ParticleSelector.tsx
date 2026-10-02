"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { useParticleStore } from "../stores/useParticleStore";
import { PARTICLE_PRESETS } from "../data/particle-presets";
import { ParticleDensity } from "../types";
import { RotateCcw, Check, Zap, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface ParticleSelectorProps {
  onClose?: () => void;
}

export function ParticleSelector({ onClose: _onClose }: ParticleSelectorProps) {
  const {
    activePreset,
    setActivePreset,
    density,
    setDensity,
    expressionTriggersEnabled,
    toggleExpressionTriggers,
    resetParticles,
  } = useParticleStore();

  const { language } = useTranslation();

  // Horizontal reel scrolling & dragging refs
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

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
  }, [updateScrollButtons]);

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

  const densities: Array<{ id: ParticleDensity; labelVi: string; labelEn: string }> = [
    { id: "low", labelVi: "Thưa", labelEn: "Low" },
    { id: "medium", labelVi: "Vừa", labelEn: "Medium" },
    { id: "high", labelVi: "Dày", labelEn: "High" },
  ];

  const currentPresetItem = PARTICLE_PRESETS.find((p) => p.id === activePreset);

  return (
    <div className="w-full flex flex-col gap-2 bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-2.5 sm:p-3 shadow-md dark:shadow-xl backdrop-blur-xl transition-all">
      {/* Top Header: Density selector & Expression trigger switch */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-white">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{language === "vi" ? "Hiệu ứng hạt động" : "Particle Engine"}</span>
          </div>

          {/* Density pills */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-950/60 p-0.5 rounded-xl border border-zinc-200 dark:border-zinc-800/60">
            {densities.map((d) => (
              <button
                key={d.id}
                onClick={() => setDensity(d.id)}
                className={cn(
                  "px-2 py-0.5 text-[11px] font-medium rounded-lg transition-colors",
                  density === d.id
                    ? "bg-amber-500 text-white font-bold shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                )}
              >
                {language === "vi" ? d.labelVi : d.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Expression trigger button & Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleExpressionTriggers}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition border",
              expressionTriggersEnabled
                ? "bg-gradient-to-r from-amber-500/15 to-pink-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-950/80 text-zinc-500 border-zinc-200 dark:border-zinc-800"
            )}
            title={
              language === "vi"
                ? "Tự động bắn hạt khi cười, chớp mắt, há miệng"
                : "Auto emit particles on smile, blink, open mouth"
            }
          >
            <Zap className={cn("w-3.5 h-3.5", expressionTriggersEnabled && "text-amber-500 fill-amber-500")} />
            <span>{language === "vi" ? "Biểu cảm" : "Expression AI"}</span>
          </button>

          {activePreset !== "none" && (
            <button
              onClick={resetParticles}
              className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
              title={language === "vi" ? "Tắt hạt rơi" : "Clear particles"}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Trigger Hint Banner if active */}
      {currentPresetItem && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/10 via-pink-500/10 to-purple-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 animate-in fade-in duration-150">
          <Zap className="w-3 h-3 text-amber-500 animate-bounce flex-shrink-0" />
          <span className="font-medium text-[11px]">
            {language === "vi" ? currentPresetItem.triggerHintVi : currentPresetItem.triggerHint}
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

        {/* Particles Horizontal Reel with Wheel + Drag-to-scroll */}
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={cn(
            "flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scroll-smooth select-none cursor-grab active:cursor-grabbing",
            "[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-zinc-100 dark:[&::-webkit-scrollbar-track]:bg-zinc-800/50 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-400"
          )}
        >
          {/* None / Reset Option */}
          <button
            onClick={() => {
              if (!hasDraggedRef.current) setActivePreset("none");
            }}
            className={cn(
              "flex flex-col items-center justify-center min-w-[70px] sm:min-w-[76px] h-20 rounded-2xl border-2 transition-all duration-150 p-1 flex-shrink-0 group",
              activePreset === "none"
                ? "border-amber-500 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 shadow-sm"
                : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            )}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-zinc-200/80 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 group-hover:scale-105 transition-transform mb-1">
              <RotateCcw className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold tracking-tight truncate w-full text-center">
              {language === "vi" ? "Không hạt" : "None"}
            </span>
          </button>

          {/* Registered Particle Presets */}
          {PARTICLE_PRESETS.map((preset) => {
            const isSelected = activePreset === preset.id;
            const name = language === "vi" ? preset.nameVi : preset.name;

            return (
              <button
                key={preset.id}
                onClick={() => {
                  if (!hasDraggedRef.current) setActivePreset(preset.id);
                }}
                className={cn(
                  "relative flex flex-col items-center justify-center min-w-[70px] sm:min-w-[76px] h-20 rounded-2xl border-2 transition-all duration-150 p-1 flex-shrink-0 group",
                  isSelected
                    ? "border-amber-500 bg-amber-500/10 dark:bg-amber-500/20 shadow-md shadow-amber-500/20 scale-[1.02]"
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 hover:border-amber-500/50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
              >
                {/* Active check pill */}
                {isSelected && (
                  <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}

                {/* Emoji Icon Preview */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700/80 text-xl group-hover:scale-110 transition-transform mb-1 pointer-events-none">
                  {preset.icon}
                </div>

                {/* Title */}
                <span
                  className={cn(
                    "text-[11px] tracking-tight truncate w-full text-center pointer-events-none",
                    isSelected
                      ? "font-bold text-amber-600 dark:text-amber-400"
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
