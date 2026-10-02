"use client";

import React from "react";
import Image from "next/image";
import { useBoothStore } from "@/stores/useBoothStore";
import { Camera, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoboothCanvasProps {
  onSlotClick?: (slotId: string) => void;
  selectedSlotId?: string | null;
  interactive?: boolean;
}

export function PhotoboothCanvas({
  onSlotClick,
  selectedSlotId,
  interactive = true,
}: PhotoboothCanvasProps) {
  const { selectedLayout, slotAssignments, frameSettings } = useBoothStore();

  const getBackgroundStyle = () => {
    if (frameSettings.backgroundType === "gradient") {
      const dirMap = {
        "to-b": "to bottom",
        "to-r": "to right",
        "to-br": "to bottom right",
        "to-tr": "to top right",
      };
      return {
        background: `linear-gradient(${dirMap[frameSettings.gradientDirection]}, ${frameSettings.gradientFrom}, ${frameSettings.gradientTo})`,
      };
    }
    return { backgroundColor: frameSettings.backgroundColor };
  };

  const getFormattedDate = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    if (frameSettings.dateFormat === "DD/MM/YYYY") return `${dd}/${mm}/${yyyy}`;
    if (frameSettings.dateFormat === "MMM DD, YYYY") {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${months[now.getMonth()]} ${dd}, ${yyyy}`;
    }
    return `${yyyy}.${mm}.${dd}`;
  };

  return (
    <div className="w-full flex items-center justify-center p-2 sm:p-4">
      {/* Photobooth Strip Canvas Wrapper */}
      <div
        className="relative shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 select-none flex flex-col justify-between"
        style={{
          width: "100%",
          maxWidth: selectedLayout.aspectRatio === "1:1" ? "460px" : selectedLayout.aspectRatio === "1:3" ? "300px" : "360px",
          aspectRatio: `${selectedLayout.width} / ${selectedLayout.height}`,
          borderWidth: `${frameSettings.borderWidth}px`,
          borderColor: frameSettings.borderColor,
          ...getBackgroundStyle(),
        }}
      >
        {/* Slots Container mapped in relative coordinate percentage */}
        <div className="relative w-full h-full">
          {selectedLayout.slots.map((slot, idx) => {
            const leftPercent = (slot.x / selectedLayout.width) * 100;
            const topPercent = (slot.y / selectedLayout.height) * 100;
            const widthPercent = (slot.width / selectedLayout.width) * 100;
            const heightPercent = (slot.height / selectedLayout.height) * 100;
            const isSlotActive = selectedSlotId === slot.id;
            const shotDataUrl = slotAssignments[slot.id];

            return (
              <div
                key={slot.id}
                onClick={() => interactive && onSlotClick?.(slot.id)}
                style={{
                  position: "absolute",
                  left: `${leftPercent}%`,
                  top: `${topPercent}%`,
                  width: `${widthPercent}%`,
                  height: `${heightPercent}%`,
                  borderRadius: `${slot.borderRadius ?? frameSettings.borderRadius}px`,
                }}
                className={cn(
                  "overflow-hidden transition-all duration-200 flex items-center justify-center group",
                  interactive && "cursor-pointer hover:ring-2 hover:ring-brand-500/80",
                  isSlotActive && "ring-4 ring-brand-500 ring-offset-2 ring-offset-black",
                  !shotDataUrl && "bg-black/10 border border-dashed border-black/20"
                )}
              >
                {shotDataUrl ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={shotDataUrl}
                      alt={`Slot ${idx + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {interactive && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold">
                        <RefreshCw className="w-4 h-4" />
                        <span>Swap</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-black/40">
                    <Camera className="w-5 h-5" />
                    <span className="text-[10px] font-mono font-bold">Slot {idx + 1}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Typography & Brand */}
        <div
          className="pb-4 pt-1 px-4 text-center z-10 flex flex-col items-center justify-center"
          style={{ color: frameSettings.textColor }}
        >
          <div
            className="text-xs sm:text-sm font-bold tracking-wider uppercase transition-colors"
            style={{ fontFamily: frameSettings.fontFamily }}
          >
            {frameSettings.footerText || "PHOTO BOOTH ✦ STUDIO"}
          </div>

          {frameSettings.showDate && (
            <div
              className="text-[10px] font-medium opacity-80 mt-0.5 tracking-wide"
              style={{ fontFamily: frameSettings.fontFamily }}
            >
              {frameSettings.footerSubtext
                ? `${frameSettings.footerSubtext} • ${getFormattedDate()}`
                : getFormattedDate()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
