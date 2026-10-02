"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface SliderProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  unit?: string;
  className?: string;
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  unit = "%",
  className,
}: SliderProps) {
  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs font-medium text-zinc-300">
          {label && <span>{label}</span>}
          {showValue && (
            <span className="font-mono text-zinc-400">
              {value}
              {unit}
            </span>
          )}
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-500 focus:outline-none"
      />
    </div>
  );
}
