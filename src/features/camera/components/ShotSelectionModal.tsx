"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useBoothStore } from "@/stores/useBoothStore";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { RotateCcw, Download, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface ShotSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetake: () => void;
}

export function ShotSelectionModal({ isOpen, onClose, onRetake }: ShotSelectionModalProps) {
  const {
    capturedShots,
    slotAssignments,
    selectedLayout,
    setCurrentStep,
  } = useBoothStore();
  const toast = useToast();

  const handleProceed = () => {
    toast.success("Photos ready! Moving to frame customization.");
    setCurrentStep("customize");
    onClose();
  };

  const handleDownloadSingle = (dataUrl: string, idx: number) => {
    const link = document.createElement("a");
    link.download = `photobooth-shot-${idx + 1}.jpg`;
    link.href = dataUrl;
    link.click();
    toast.success(`Downloaded Shot #${idx + 1}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Photo Selection & Review"
      description={`Review your ${capturedShots.length} captured burst cuts for ${selectedLayout.name}`}
      maxWidth="2xl"
    >
      <div className="flex flex-col gap-6 py-2">
        {/* Shots Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[420px] overflow-y-auto p-1">
          {capturedShots.map((shot, idx) => {
            const isAssigned = Object.values(slotAssignments).includes(shot.dataUrl);

            return (
              <motion.div
                key={shot.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all shadow-md group ${
                  isAssigned
                    ? "border-brand-500 ring-2 ring-brand-500/40"
                    : "border-zinc-800 opacity-80"
                }`}
              >
                <Image
                  src={shot.dataUrl}
                  alt={`Shot ${idx + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />

                {/* Selection badge */}
                <div className="absolute top-2 left-2 z-10">
                  <div className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-xs shadow-glow">
                    {idx + 1}
                  </div>
                </div>

                {/* Single download overlay */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadSingle(shot.dataUrl, idx);
                  }}
                  className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-black text-zinc-300 hover:text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Download single shot"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-zinc-800">
          <Button variant="ghost" size="sm" onClick={onRetake} className="w-full sm:w-auto">
            <RotateCcw className="w-4 h-4 mr-1.5" />
            <span>Retake All</span>
          </Button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              variant="studio"
              size="md"
              onClick={handleProceed}
              className="w-full sm:w-auto shadow-glow"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              <span>Customize Frame &rarr;</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
