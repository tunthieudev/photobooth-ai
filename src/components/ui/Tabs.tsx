"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TabOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  options: TabOption[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: "pill" | "underline" | "bubble";
  className?: string;
}

export function Tabs({
  options,
  activeId,
  onChange,
  variant = "pill",
  className,
}: TabsProps) {
  if (variant === "bubble") {
    return (
      <div className={cn("flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl", className)}>
        {options.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-xl transition-colors duration-200 select-none",
                isActive ? "text-white font-semibold" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="bubble-tab-indicator"
                  className="absolute inset-0 bg-brand-500 rounded-xl shadow-glow"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {tab.icon && <span>{tab.icon}</span>}
                {tab.label}
                {tab.badge !== undefined && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white">
                    {tab.badge}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("flex border-b border-zinc-800 gap-4 overflow-x-auto no-scrollbar", className)}>
      {options.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative pb-3 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2",
              isActive ? "text-brand-400 font-semibold" : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {isActive && (
              <motion.div
                layoutId="underline-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-400"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
