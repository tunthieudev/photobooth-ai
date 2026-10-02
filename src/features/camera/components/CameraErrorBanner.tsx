"use client";

import React from "react";
import { RefreshCw, CameraOff, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CameraErrorBannerProps {
  error: string;
  onRetry: () => void;
}

export function CameraErrorBanner({ error, onRetry }: CameraErrorBannerProps) {
  const isPermissionDenied =
    error.toLowerCase().includes("permission") || error.toLowerCase().includes("denied");

  return (
    <div className="w-full max-w-xl mx-auto my-6 p-6 rounded-3xl bg-zinc-900 border border-rose-900/50 shadow-2xl text-center flex flex-col items-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 shadow-glow">
        {isPermissionDenied ? <ShieldAlert className="w-8 h-8" /> : <CameraOff className="w-8 h-8" />}
      </div>

      <h3 className="text-lg font-bold text-white mb-1">
        {isPermissionDenied ? "Camera Permission Required" : "Camera Unavailable"}
      </h3>

      <p className="text-sm text-zinc-400 mb-6 max-w-md leading-relaxed">{error}</p>

      {isPermissionDenied && (
        <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 text-left text-xs text-zinc-300 w-full mb-6 space-y-2">
          <div className="font-semibold text-white">How to allow camera access:</div>
          <ol className="list-decimal list-inside space-y-1 text-zinc-400">
            <li>Click the lock or camera icon in your browser address bar.</li>
            <li>Switch the Camera toggle to <strong>Allow</strong>.</li>
            <li>Click the &quot;Try Again&quot; button below or reload the page.</li>
          </ol>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button variant="studio" size="md" onClick={onRetry}>
          <RefreshCw className="w-4 h-4 mr-1.5" />
          <span>Try Again</span>
        </Button>
      </div>
    </div>
  );
}
