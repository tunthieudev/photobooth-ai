"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Image as ImageIcon,
  Compass,
  Calendar,
  X,
  Wand2,
} from "lucide-react";
import { useUIStore } from "@/stores/useUIStore";
import { useTranslation } from "@/lib/i18n";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();
  const { t } = useTranslation();

  const sidebarLinks = [
    { href: "/booth", label: t.nav.booth, icon: <Camera className="w-5 h-5 text-rose-400" /> },
    { href: "/explore", label: t.nav.templates, icon: <Compass className="w-5 h-5 text-indigo-400" /> },
    { href: "/ai-studio", label: t.nav.aiStudio, icon: <Wand2 className="w-5 h-5 text-pink-400" />, badge: "DeepSeek" },
    { href: "/gallery", label: t.nav.gallery, icon: <ImageIcon className="w-5 h-5 text-emerald-400" /> },
    { href: "/events", label: t.nav.events, icon: <Calendar className="w-5 h-5 text-amber-400" /> },
  ];

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Drawer content */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-72 h-full bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between p-6 shadow-2xl"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-6 border-b border-zinc-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-base text-white tracking-tight">PHOTOBOOTH</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Links */}
              <nav className="mt-6 flex flex-col gap-1.5">
                {sidebarLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all",
                        isActive
                          ? "bg-zinc-800/90 text-white border border-zinc-700/60 shadow-sm"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {link.icon}
                        <span>{link.label}</span>
                      </div>
                      {link.badge && (
                        <Badge variant="pro" className="text-[10px]">
                          {link.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom info & Language */}
            <div className="pt-4 border-t border-zinc-800/80 text-xs text-zinc-500 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span>{t.nav.language}</span>
                <LanguageToggle showLabel />
              </div>
              <div className="flex items-center justify-between">
                <span>Status</span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>
              <p className="text-[11px] text-zinc-600">AI Photo Booth & Meme Studio v1.0</p>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
