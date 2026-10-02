"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Compass, Sparkles, Image as ImageIcon, Calendar } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    { href: "/booth", label: t.nav.booth, icon: Camera },
    { href: "/explore", label: t.nav.templates, icon: Compass },
    { href: "/ai-studio", label: t.nav.aiStudio, icon: Sparkles, isCenter: true },
    { href: "/gallery", label: t.nav.gallery, icon: ImageIcon },
    { href: "/events", label: t.nav.events, icon: Calendar },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/80 px-2 py-1.5 pb-safe">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-glow border-2 border-zinc-950 active:scale-95 transition-transform">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] font-semibold text-zinc-300 mt-1">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors",
                isActive ? "text-brand-400" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
