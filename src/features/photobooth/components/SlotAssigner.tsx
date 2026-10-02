"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useBoothStore } from "@/stores/useBoothStore";
import { PhotoboothCanvas } from "./PhotoboothCanvas";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Sparkles, Check, Wand2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/lib/i18n";

interface SlotAssignerProps {
  onContinue: () => void;
  onRetake: () => void;
}

export function SlotAssigner({ onContinue, onRetake }: SlotAssignerProps) {
  const {
    selectedLayout,
    capturedShots,
    slotAssignments,
    assignShotToSlot,
    autoAssignShots,
  } = useBoothStore();
  const [activeSlotId, setActiveSlotId] = useState<string>(selectedLayout.slots[0]?.id || "");
  const toast = useToast();
  const { t } = useTranslation();

  const handleSelectShotForSlot = (shotDataUrl: string) => {
    if (!activeSlotId) {
      toast.info(t.booth.selectStep.emptySlot);
      return;
    }
    assignShotToSlot(activeSlotId, shotDataUrl);

    // Auto advance to next empty slot
    const slots = selectedLayout.slots;
    const currentIndex = slots.findIndex((s) => s.id === activeSlotId);
    const nextSlot = slots[(currentIndex + 1) % slots.length];
    if (nextSlot) {
      setActiveSlotId(nextSlot.id);
    }
  };

  const assignedCount = Object.keys(slotAssignments).length;
  const totalRequired = selectedLayout.slots.length;

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 items-start justify-center max-w-6xl mx-auto py-4">
      {/* Left: Interactive Canvas Strip */}
      <div className="w-full lg:w-1/2 flex flex-col items-center">
        <div className="flex items-center justify-between w-full max-w-sm mb-3 px-2">
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Live Strip Preview</span>
          <Badge variant={assignedCount >= totalRequired ? "success" : "brand"}>
            {assignedCount} / {totalRequired} {t.booth.layoutStep.cuts}
          </Badge>
        </div>

        <PhotoboothCanvas
          interactive={true}
          selectedSlotId={activeSlotId}
          onSlotClick={(slotId) => setActiveSlotId(slotId)}
        />
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 text-center">
          💡 {t.booth.selectStep.subtitle}
        </p>
      </div>

      {/* Right: Captured Photos Pool & Actions */}
      <div className="w-full lg:w-1/2 flex flex-col gap-6 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-md dark:shadow-xl transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">{t.booth.selectStep.availableShots}</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {t.booth.selectStep.subtitle} (
              <strong className="text-brand-500">
                Ô {selectedLayout.slots.findIndex((s) => s.id === activeSlotId) + 1}
              </strong>)
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={autoAssignShots}>
            <Wand2 className="w-3.5 h-3.5 mr-1" />
            <span>{t.booth.selectStep.autoFill}</span>
          </Button>
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[340px] overflow-y-auto p-1">
          {capturedShots.map((shot, idx) => {
            const isAssigned = Object.values(slotAssignments).includes(shot.dataUrl);

            return (
              <div
                key={shot.id}
                onClick={() => handleSelectShotForSlot(shot.dataUrl)}
                className="relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border-2 border-zinc-200 dark:border-zinc-700/80 hover:border-brand-500 hover:scale-105 active:scale-95 transition-all shadow-sm group"
              >
                <Image
                  src={shot.dataUrl}
                  alt={`Shot ${idx + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-black/60 border border-white/40 flex items-center justify-center text-[10px] text-white font-bold">
                  {idx + 1}
                </div>

                {isAssigned && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] shadow">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-3">
          <Button variant="ghost" size="md" onClick={onRetake}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            <span>{t.booth.selectStep.retake}</span>
          </Button>

          <Button
            variant="studio"
            size="lg"
            onClick={onContinue}
            className="shadow-glow"
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            <span dangerouslySetInnerHTML={{ __html: t.booth.selectStep.continueCustomize }} />
          </Button>
        </div>
      </div>
    </div>
  );
}
