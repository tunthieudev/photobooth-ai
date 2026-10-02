"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useBoothStore } from "@/stores/useBoothStore";
import { useCameraStore } from "@/stores/useCameraStore";
import { Sparkles, Camera, Check } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export function BurstStripPreview() {
  const { selectedLayout, capturedShots } = useBoothStore();
  const { burstCount, isCapturing } = useCameraStore();

  const totalSlots = Math.min(burstCount, selectedLayout.slots.length || 4);

  return (
    <div className="flex flex-col bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800/80 rounded-3xl p-4 shadow-md dark:shadow-xl backdrop-blur-xl w-full max-w-xs mx-auto transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-500" />
          <span className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">{selectedLayout.name}</span>
        </div>
        <Badge variant={capturedShots.length === totalSlots ? "success" : "brand"}>
          {capturedShots.length} / {totalSlots} Shots
        </Badge>
      </div>

      {/* Photobooth Strip Canvas Preview */}
      <div className="mt-4 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-2 items-center min-h-[380px] justify-center transition-colors">
        {Array.from({ length: totalSlots }).map((_, index) => {
          const shot = capturedShots[index];
          return (
            <div
              key={index}
              className={cn(
                "relative w-full aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all duration-300 flex items-center justify-center",
                shot
                  ? "border-brand-500/80 shadow-md bg-black"
                  : isCapturing && index === capturedShots.length
                  ? "border-amber-400 bg-amber-500/10 animate-pulse"
                  : "border-dashed border-zinc-300 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/40 text-zinc-400 dark:text-zinc-600 shadow-sm"
              )}
            >
              <AnimatePresence mode="wait">
                {shot ? (
                  <motion.div
                    key={shot.id}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={shot.dataUrl}
                      alt={`Cut ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] shadow">
                      <Check className="w-3 h-3" />
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Camera className="w-5 h-5 text-zinc-400 dark:text-zinc-600" />
                    <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-500">Cut {index + 1}</span>
                  </div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Footer Brand Text */}
        <div className="pt-2 text-[10px] tracking-widest font-mono text-zinc-500 dark:text-zinc-500 uppercase text-center font-medium">
          {selectedLayout.footerText || "PHOTO BOOTH ✦ MEMORIES"}
        </div>
      </div>
    </div>
  );
}
