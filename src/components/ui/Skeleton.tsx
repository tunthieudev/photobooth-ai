import React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-zinc-800/70", className)}
      {...props}
    />
  );
}

export function PhotoCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-2xl">
      <Skeleton className="w-full aspect-[3/4] rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}
