"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useBoothStore } from "@/stores/useBoothStore";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Download,
  Share2,
  RotateCcw,
  Sparkles,
  Check,
  Wand2,
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/lib/i18n";

interface ResultViewProps {
  resultUrl: string;
  onRetake: () => void;
}

export function ResultView({ resultUrl, onRetake }: ResultViewProps) {
  const { selectedLayout } = useBoothStore();
  const [copied, setCopied] = useState(false);
  const toast = useToast();
  const { t } = useTranslation();

  const handleDownload = () => {
    const link = document.createElement("a");
    link.download = `photobooth-${selectedLayout.slug}-${Date.now()}.png`;
    link.href = resultUrl;
    link.click();
    toast.success(t.booth.resultStep.title + " 🎉");
  };

  const handleCopy = async () => {
    try {
      const blob = await (await fetch(resultUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopied(true);
      toast.success(t.booth.resultStep.copied);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.info(t.booth.resultStep.share);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-6 flex flex-col items-center">
      {/* Top Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-6 shadow-glow"
      >
        <Sparkles className="w-4 h-4" />
        <span>{t.booth.resultStep.title}</span>
      </motion.div>

      {/* Main Result Display Grid */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Animated Developing Strip Canvas */}
        <div className="lg:col-span-6 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.6, bounce: 0.2 }}
            className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 group"
            style={{
              maxWidth:
                selectedLayout.aspectRatio === "1:1"
                  ? "420px"
                  : selectedLayout.aspectRatio === "1:3"
                  ? "300px"
                  : "360px",
            }}
          >
            {/* Shimmer / Developing Glow Effect */}
            <div className="relative w-full h-auto">
              <Image
                src={resultUrl}
                alt="Final Photobooth Strip"
                width={selectedLayout.width}
                height={selectedLayout.height}
                className="w-full h-auto object-contain rounded-xl"
                unoptimized
              />
            </div>
          </motion.div>
        </div>

        {/* Right: Actions & Options Card */}
        <div className="lg:col-span-6 flex flex-col gap-5 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-2xl backdrop-blur-xl transition-colors">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                {selectedLayout.name}
              </h2>
              <Badge variant="brand">300 DPI Ultra HD</Badge>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {t.booth.resultStep.subtitle}
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              variant="studio"
              size="lg"
              onClick={handleDownload}
              className="w-full shadow-glow text-base"
            >
              <Download className="w-5 h-5 mr-2" />
              <span>{t.booth.resultStep.downloadPng}</span>
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" size="md" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1.5 text-emerald-500" />
                    <span>{t.booth.resultStep.copied}</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 mr-1.5" />
                    <span>{t.booth.resultStep.share}</span>
                  </>
                )}
              </Button>

              <Button variant="outline" size="md" onClick={onRetake}>
                <RotateCcw className="w-4 h-4 mr-1.5" />
                <span>{t.booth.resultStep.createNew}</span>
              </Button>
            </div>
          </div>

          {/* AI Transform teaser */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-pink-50 to-zinc-50 dark:from-purple-950/40 dark:via-pink-950/30 dark:to-zinc-950 border border-purple-200 dark:border-purple-800/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-pink-500/15 text-pink-600 dark:text-pink-400">
                <Wand2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-900 dark:text-white">AI Transform & Meme Studio</div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">DeepSeek AI Viral Captions</div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-pink-600 dark:text-pink-400 text-xs">
              Phase 4+ &rarr;
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
