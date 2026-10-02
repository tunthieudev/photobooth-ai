"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Sparkles, Image as ImageIcon, Compass, Calendar, Menu, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useUIStore } from "@/stores/useUIStore";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const { toggleSidebar } = useUIStore();
  const { t } = useTranslation();

  const navLinks = [
    { href: "/booth", label: t.nav.booth, icon: <Camera className="w-4 h-4" /> },
    { href: "/explore", label: t.nav.templates, icon: <Compass className="w-4 h-4" /> },
    { href: "/ai-studio", label: t.nav.aiStudio, icon: <Sparkles className="w-4 h-4 text-pink-400" /> },
    { href: "/gallery", label: t.nav.gallery, icon: <ImageIcon className="w-4 h-4" /> },
    { href: "/events", label: t.nav.events, icon: <Calendar className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-pink-500 to-purple-600 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-200">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-800 to-rose-600 dark:from-white dark:via-zinc-200 dark:to-pink-300 bg-clip-text text-transparent">
                  PHOTOBOOTH
                </span>
                <Badge variant="pro" className="text-[10px] py-0 px-1.5">
                  AI STUDIO
                </Badge>
              </div>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900/60 p-1 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/60">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150",
                  isActive
                    ? "bg-white dark:bg-brand-500/20 text-brand-600 dark:text-brand-300 border border-zinc-200 dark:border-brand-500/30 shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/50"
                )}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <LanguageToggle />
          <ThemeToggle />
          <Link href="/booth">
            <Button variant="studio" size="sm" className="hidden sm:inline-flex shadow-glow">
              <PlusCircle className="w-4 h-4" />
              <span>{t.nav.enterBooth}</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
