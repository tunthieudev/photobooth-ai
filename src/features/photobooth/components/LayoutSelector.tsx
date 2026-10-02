"use client";

import React from "react";
import { useBoothStore } from "@/stores/useBoothStore";
import { DEFAULT_LAYOUTS } from "../constants/layouts";
import { IBoothLayout } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutSelectorProps {
  onSelect?: (layout: IBoothLayout) => void;
}

export function LayoutSelector({ onSelect }: LayoutSelectorProps) {
  const { selectedLayout, setSelectedLayout } = useBoothStore();

  const handleSelect = (layout: IBoothLayout) => {
    setSelectedLayout(layout);
    onSelect?.(layout);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {DEFAULT_LAYOUTS.map((layout) => {
        const isSelected = selectedLayout.id === layout.id;

        return (
          <div
            key={layout.id}
            onClick={() => handleSelect(layout)}
            className={cn(
              "p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between group shadow-sm",
              isSelected
                ? "bg-white dark:bg-zinc-900 border-brand-500 shadow-glow"
                : "bg-white/80 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/70"
            )}
          >
            {/* Visual Mini Layout Blueprint */}
            <div className="w-full aspect-[4/3] bg-zinc-50 dark:bg-zinc-950 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800/80 mb-3 flex flex-col items-center justify-center relative overflow-hidden group-hover:border-brand-500/40 transition-colors">
              <div
                className="w-full h-full bg-white dark:bg-zinc-900/90 rounded-lg p-2 flex flex-col justify-between items-center shadow-sm border border-zinc-200 dark:border-zinc-800 relative"
                style={{
                  maxWidth: layout.aspectRatio === "1:1" ? "120px" : layout.aspectRatio === "1:3" ? "75px" : "90px",
                  aspectRatio: `${layout.width} / ${layout.height}`,
                }}
              >
                <div className="w-full h-full relative">
                  {layout.slots.map((slot, idx) => {
                    const left = (slot.x / layout.width) * 100;
                    const top = (slot.y / layout.height) * 100;
                    const width = (slot.width / layout.width) * 100;
                    const height = (slot.height / layout.height) * 100;

                    return (
                      <div
                        key={slot.id}
                        style={{
                          position: "absolute",
                          left: `${left}%`,
                          top: `${top}%`,
                          width: `${width}%`,
                          height: `${height}%`,
                          borderRadius: "3px",
                        }}
                        className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700/60 flex items-center justify-center text-[8px] font-mono text-zinc-600 dark:text-zinc-400"
                      >
                        {idx + 1}
                      </div>
                    );
                  })}
                </div>

                <div className="text-[7px] text-zinc-500 font-mono tracking-tighter truncate w-full text-center mt-1">
                  {layout.footerText || "PHOTO BOOTH"}
                </div>
              </div>

              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-white shadow">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            {/* Layout Information */}
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white">{layout.name}</h3>
                <Badge variant={isSelected ? "brand" : "default"}>
                  {layout.slots.length} Cuts
                </Badge>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
                Ratio {layout.aspectRatio} • {layout.width}x{layout.height}px
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
