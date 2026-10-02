"use client";

import React from "react";
import { useTranslation } from "@/lib/i18n";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function LanguageToggle({ className, showLabel = false }: LanguageToggleProps) {
  const { language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === "vi" ? "en" : "vi");
  };

  return (
    <button
      onClick={toggleLanguage}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-300 hover:text-white transition-all duration-150 shadow-sm",
        className
      )}
      title={language === "vi" ? "Đổi sang English" : "Switch to Tiếng Việt"}
      aria-label="Toggle language"
    >
      <Globe className="w-3.5 h-3.5 text-brand-400" />
      <span className="font-mono text-[11px] tracking-wider uppercase">
        {language === "vi" ? "VI 🇻🇳" : "EN 🇬🇧"}
      </span>
      {showLabel && (
        <span className="text-zinc-400 text-xs hidden sm:inline">
          {language === "vi" ? "Tiếng Việt" : "English"}
        </span>
      )}
    </button>
  );
}
