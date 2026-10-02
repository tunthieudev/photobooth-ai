"use client";

import React, { useState } from "react";
import { useBoothStore } from "@/stores/useBoothStore";
import { FRAME_COLORS, FRAME_GRADIENTS, FONT_OPTIONS, CAPTION_PRESETS } from "../constants/themes";
import { Tabs } from "@/components/ui/Tabs";
import { Slider } from "@/components/ui/Slider";
import { Palette, Type, Sliders, Calendar, Check } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function FrameCustomizer() {
  const { frameSettings, updateFrameSettings } = useBoothStore();
  const [activeTab, setActiveTab] = useState<string>("colors");
  const { t } = useTranslation();

  const tabs = [
    { id: "colors", label: t.booth.customizeStep.gradientPreset, icon: <Palette className="w-4 h-4" /> },
    { id: "text", label: t.booth.customizeStep.fontFamily, icon: <Type className="w-4 h-4" /> },
    { id: "border", label: t.booth.customizeStep.frameBorder, icon: <Sliders className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800/80 rounded-3xl p-4 sm:p-6 shadow-md dark:shadow-xl backdrop-blur-xl w-full transition-colors">
      {/* Header Tabs */}
      <Tabs
        options={tabs}
        activeId={activeTab}
        onChange={setActiveTab}
        variant="bubble"
        className="mb-6"
      />

      {/* Tab 1: Colors & Gradients */}
      {activeTab === "colors" && (
        <div className="flex flex-col gap-6">
          {/* Solid Colors */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-3 block">
              {t.booth.customizeStep.solidColor}
            </label>
            <div className="grid grid-cols-5 gap-2.5">
              {FRAME_COLORS.map((color) => {
                const isSelected =
                  frameSettings.backgroundType === "color" &&
                  frameSettings.backgroundColor.toLowerCase() === color.hex.toLowerCase();

                return (
                  <button
                    key={color.id}
                    onClick={() =>
                      updateFrameSettings({
                        backgroundType: "color",
                        backgroundColor: color.hex,
                        textColor: color.textColor,
                      })
                    }
                    className={cn(
                      "relative h-11 rounded-xl border-2 transition-all flex items-center justify-center shadow-sm",
                      isSelected
                        ? "border-brand-500 scale-105 ring-2 ring-brand-500/40"
                        : "border-zinc-700/80 hover:scale-105"
                    )}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {isSelected && (
                      <Check
                        className="w-4 h-4 shadow"
                        style={{ color: color.textColor }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gradient Presets */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 mb-3 block">
              Vibrant Studio Gradients
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {FRAME_GRADIENTS.map((grad) => {
                const isSelected =
                  frameSettings.backgroundType === "gradient" &&
                  frameSettings.gradientFrom === grad.from &&
                  frameSettings.gradientTo === grad.to;

                return (
                  <button
                    key={grad.id}
                    onClick={() =>
                      updateFrameSettings({
                        backgroundType: "gradient",
                        gradientFrom: grad.from,
                        gradientTo: grad.to,
                        textColor: grad.textColor,
                      })
                    }
                    className={cn(
                      "relative h-12 rounded-xl border-2 transition-all flex items-center justify-center shadow-sm p-2 text-center",
                      isSelected
                        ? "border-brand-500 scale-105 ring-2 ring-brand-500/40"
                        : "border-zinc-700/80 hover:scale-105"
                    )}
                    style={{
                      background: `linear-gradient(to right, ${grad.from}, ${grad.to})`,
                    }}
                  >
                    <span
                      className="text-[11px] font-bold truncate drop-shadow"
                      style={{ color: grad.textColor }}
                    >
                      {grad.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Color Input */}
          <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-2xl border border-zinc-800">
            <span className="text-xs text-zinc-300 font-medium">Custom Color</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={frameSettings.backgroundColor}
                onChange={(e) =>
                  updateFrameSettings({
                    backgroundType: "color",
                    backgroundColor: e.target.value,
                  })
                }
                className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-zinc-700"
              />
              <span className="text-xs font-mono text-zinc-400 uppercase">
                {frameSettings.backgroundColor}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Typography & Date */}
      {activeTab === "text" && (
        <div className="flex flex-col gap-5">
          {/* Main Footer Caption */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">Frame Caption</label>
            <input
              type="text"
              value={frameSettings.footerText}
              onChange={(e) => updateFrameSettings({ footerText: e.target.value })}
              placeholder="e.g. PHOTO BOOTH ✦ STUDIO"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 font-medium"
            />
          </div>

          {/* Caption Quick Presets */}
          <div>
            <span className="text-[11px] text-zinc-400 mb-2 block font-medium">
              Quick Caption Ideas:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CAPTION_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => updateFrameSettings({ footerText: preset })}
                  className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300 hover:text-white hover:border-zinc-700 transition"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Subtext */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">Subtext (Optional)</label>
            <input
              type="text"
              value={frameSettings.footerSubtext}
              onChange={(e) => updateFrameSettings({ footerSubtext: e.target.value })}
              placeholder="e.g. OUR SPECIAL DAY ♡"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Font Family Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-zinc-300">Font Style</label>
            <div className="grid grid-cols-2 gap-2">
              {FONT_OPTIONS.map((font) => {
                const isSelected = frameSettings.fontFamily === font.id;
                return (
                  <button
                    key={font.id}
                    onClick={() => updateFrameSettings({ fontFamily: font.id })}
                    className={cn(
                      "p-2.5 rounded-xl border text-left text-xs transition",
                      isSelected
                        ? "bg-brand-500/20 border-brand-500 text-white font-semibold"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                    )}
                    style={{ fontFamily: font.id }}
                  >
                    {font.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Toggle */}
          <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-2xl border border-zinc-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-400" />
              <span className="text-xs font-medium text-zinc-300">Show Date Stamp</span>
            </div>
            <input
              type="checkbox"
              checked={frameSettings.showDate}
              onChange={(e) => updateFrameSettings({ showDate: e.target.checked })}
              className="w-4 h-4 accent-brand-500 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Tab 3: Border & Corners */}
      {activeTab === "border" && (
        <div className="flex flex-col gap-6">
          {/* Corner Radius Slider */}
          <Slider
            label="Photo Slot Rounded Corners"
            min={0}
            max={32}
            step={2}
            unit="px"
            value={frameSettings.borderRadius}
            onChange={(val) => updateFrameSettings({ borderRadius: val })}
          />

          {/* Border Width Slider */}
          <Slider
            label="Outer Frame Border Width"
            min={0}
            max={12}
            step={1}
            unit="px"
            value={frameSettings.borderWidth}
            onChange={(val) => updateFrameSettings({ borderWidth: val })}
          />

          {/* Border Color */}
          {frameSettings.borderWidth > 0 && (
            <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-2xl border border-zinc-800">
              <span className="text-xs text-zinc-300 font-medium">Border Color</span>
              <input
                type="color"
                value={frameSettings.borderColor}
                onChange={(e) => updateFrameSettings({ borderColor: e.target.value })}
                className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-zinc-700"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
