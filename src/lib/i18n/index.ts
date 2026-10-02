"use client";

import { useUIStore } from "@/stores/useUIStore";
import { translations } from "./translations";

export * from "./translations";

export function useTranslation() {
  const language = useUIStore((state) => state.language);
  const setLanguage = useUIStore((state) => state.setLanguage);

  const t = translations[language] || translations.vi;

  return {
    language,
    setLanguage,
    t,
    isVietnamese: language === "vi",
    isEnglish: language === "en",
  };
}
