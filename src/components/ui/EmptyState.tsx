import React from "react";
import { Camera, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 max-w-md mx-auto",
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-brand-400 mb-4 shadow-inner">
        {icon || <Camera className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 mb-6 leading-relaxed">{description}</p>
      {actionLabel && (
        <Button onClick={onAction} variant="studio" size="md">
          <Sparkles className="w-4 h-4" />
          <span>{actionLabel}</span>
        </Button>
      )}
    </div>
  );
}

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-rose-950/20 border border-rose-900/30 text-rose-200 max-w-md mx-auto",
        className
      )}
    >
      <AlertTriangle className="w-10 h-10 text-rose-400 mb-3" />
      <h4 className="text-base font-semibold text-rose-100 mb-1">{title}</h4>
      <p className="text-xs text-rose-300/80 mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="danger" size="sm">
          Try Again
        </Button>
      )}
    </div>
  );
}
