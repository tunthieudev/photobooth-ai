import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "bordered" | "interactive";
}

export function Card({ className, variant = "default", children, ...props }: CardProps) {
  const variantStyles = {
    default: "bg-zinc-900/90 border border-zinc-800 text-zinc-100 rounded-2xl shadow-xl",
    glass:
      "bg-zinc-900/60 backdrop-blur-xl border border-white/10 text-zinc-100 rounded-2xl shadow-glass",
    bordered: "bg-transparent border border-zinc-800 rounded-2xl text-zinc-100",
    interactive:
      "bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800 hover:border-zinc-700 text-zinc-100 rounded-2xl shadow-lg transition-all duration-200 cursor-pointer hover:translate-y-[-2px]",
  };

  return (
    <div className={cn(variantStyles[variant], "p-4 sm:p-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col space-y-1.5 pb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg sm:text-xl font-semibold leading-none tracking-tight text-white", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-zinc-400 leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}
