import React from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Sparkles } from "lucide-react";

export default function AIStudioPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <EmptyState
        icon={<Sparkles className="w-8 h-8 text-pink-400" />}
        title="AI Creative Studio"
        description="DeepSeek meme generator, AI background replacer, smart relighting, and style transfer."
        actionLabel="Try AI Generators"
      />
    </div>
  );
}
