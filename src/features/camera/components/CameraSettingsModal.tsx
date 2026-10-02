"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useCameraStore } from "@/stores/useCameraStore";
import { RESOLUTION_PRESETS, CameraResolution } from "../hooks/useCameraStream";
import { Video, Sliders, Volume2 } from "lucide-react";

interface CameraSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedResolution: CameraResolution;
  onSelectResolution: (res: CameraResolution) => void;
  actualResolution: { width: number; height: number };
}

export function CameraSettingsModal({
  isOpen,
  onClose,
  selectedResolution,
  onSelectResolution,
  actualResolution,
}: CameraSettingsModalProps) {
  const { availableDevices, selectedDeviceId, setSelectedDeviceId } = useCameraStore();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Camera Studio Settings"
      description="Configure your video source, camera resolution, and audio cues."
      maxWidth="md"
    >
      <div className="flex flex-col gap-6 py-2">
        {/* Device Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
            <Video className="w-4 h-4 text-brand-400" />
            <span>Select Camera Device</span>
          </label>
          {availableDevices.length === 0 ? (
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs text-zinc-400">
              Default system webcam
            </div>
          ) : (
            <select
              value={selectedDeviceId || ""}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-500"
            >
              {availableDevices.map((device, idx) => (
                <option key={device.deviceId || idx} value={device.deviceId}>
                  {device.label || `Camera ${idx + 1}`}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Resolution Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-pink-400" />
            <span>Capture Resolution</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {RESOLUTION_PRESETS.map((res) => {
              const isSelected = selectedResolution.width === res.width;
              return (
                <button
                  key={res.label}
                  onClick={() => onSelectResolution(res)}
                  className={`p-3 rounded-xl border text-left transition ${
                    isSelected
                      ? "bg-brand-500/20 border-brand-500 text-white"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  <div className="text-xs font-bold">{res.label.split(" ")[0]}</div>
                  <div className="text-[10px] font-mono text-zinc-500 mt-1">
                    {res.width}x{res.height}
                  </div>
                </button>
              );
            })}
          </div>
          {actualResolution.width > 0 && (
            <p className="text-[11px] text-zinc-400 font-mono">
              Live Feed: {actualResolution.width} x {actualResolution.height} px
            </p>
          )}
        </div>

        {/* Audio feedback notice */}
        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center gap-3">
          <Volume2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <div className="font-semibold text-white">Audio Feedback Enabled</div>
            <div className="text-zinc-400 text-[11px]">
              Shutter sounds & countdown beeps are generated via Web Audio API.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <Button variant="primary" onClick={onClose} size="md">
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
