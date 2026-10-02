import React from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Image as ImageIcon } from "lucide-react";

export default function GalleryPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <EmptyState
        icon={<ImageIcon className="w-8 h-8 text-emerald-400" />}
        title="Your Photo Strips"
        description="All your captured photobooths, Purikura creations, GIFs, and AI remixes will appear here."
        actionLabel="Take First Photo"
      />
    </div>
  );
}
