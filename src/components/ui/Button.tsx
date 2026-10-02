"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "studio" | "glow";
  size?: "sm" | "md" | "lg" | "icon" | "pill";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-medium transition-all duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const variantStyles = {
      primary:
        "bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20 hover:shadow-brand-500/30",
      secondary:
        "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700/60 shadow-sm",
      outline:
        "border border-zinc-700 hover:border-zinc-500 bg-transparent hover:bg-zinc-800/60 text-zinc-100",
      ghost: "hover:bg-zinc-800/80 text-zinc-300 hover:text-white",
      danger: "bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20",
      studio:
        "bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:opacity-95 text-white shadow-glow hover:shadow-lg transition-all",
      glow: "bg-white text-zinc-950 hover:bg-zinc-100 shadow-[0_0_20px_rgba(255,255,255,0.35)]",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
      md: "h-10 px-4 text-sm rounded-xl gap-2",
      lg: "h-12 px-6 text-base rounded-2xl gap-2.5 font-semibold",
      icon: "h-10 w-10 p-0 rounded-xl justify-center",
      pill: "h-11 px-6 rounded-full text-sm font-semibold tracking-wide gap-2",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
