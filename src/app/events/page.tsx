import React from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Calendar } from "lucide-react";

export default function EventsPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <EmptyState
        icon={<Calendar className="w-8 h-8 text-amber-400" />}
        title="Event Photo Booth & Kiosk"
        description="Host weddings, birthdays, corporate parties with custom branded QR codes and real-time live galleries."
        actionLabel="Create Event"
      />
    </div>
  );
}
