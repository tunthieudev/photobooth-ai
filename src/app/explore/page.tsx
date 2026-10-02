import React from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Compass } from "lucide-react";

export default function ExplorePage() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <EmptyState
        icon={<Compass className="w-8 h-8 text-indigo-400" />}
        title="Template & Remix Hub"
        description="Discover viral photobooth templates, trending Korean aesthetic frames, and community remixes."
        actionLabel="Explore Trending"
      />
    </div>
  );
}
