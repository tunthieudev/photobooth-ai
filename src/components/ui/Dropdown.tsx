"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}

export interface DropdownProps {
  label: React.ReactNode;
  items: DropdownItem[];
  className?: string;
}

export function Dropdown({ label, items, className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative inline-block text-left", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between gap-2 px-3 py-2 text-sm font-medium text-zinc-200 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 rounded-xl transition-all"
      >
        <span>{label}</span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-52 origin-top-right rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl py-1 focus:outline-none animate-in fade-in-50 zoom-in-95">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                item.onClick?.();
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors",
                item.danger
                  ? "text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                  : "text-zinc-200 hover:bg-zinc-800 hover:text-white"
              )}
            >
              {item.icon && <span className="w-4 h-4 shrink-0">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
