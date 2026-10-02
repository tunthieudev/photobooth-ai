"use client";

import React, { useEffect } from "react";
import { useUIStore } from "@/stores/useUIStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUIStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
    localStorage.setItem("photobooth_theme", theme);
  }, [theme]);

  return <>{children}</>;
}
