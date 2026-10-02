"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Camera,
  Sparkles,
  Layers,
  Zap,
  Palette,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DEFAULT_LAYOUTS } from "@/lib/constants";
import { Footer } from "@/components/layout/Footer";
import { useTranslation } from "@/lib/i18n";

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-brand-600/25 via-pink-600/20 to-purple-600/20 blur-[130px] -z-10 pointer-events-none rounded-full" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-700/60 text-xs font-medium text-zinc-300 mb-6 shadow-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <span>{t.home.badge}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]"
          >
            {t.home.heroTitle} <br />
            <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              {t.home.heroSubtitle}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          >
            {t.home.heroDesc}
          </motion.p>

          {/* Call to action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link href="/booth">
              <Button variant="studio" size="lg" className="shadow-glow group">
                <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>{t.home.ctaStart}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>

            <Link href="/explore">
              <Button variant="secondary" size="lg">
                <Sparkles className="w-5 h-5 text-brand-400" />
                <span>{t.home.ctaTemplates}</span>
              </Button>
            </Link>
          </motion.div>

          {/* Quick stats / highlights */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { title: "60 FPS", desc: "Realtime WebGL & AR", icon: <Zap className="w-4 h-4 text-amber-400" /> },
              { title: "Korean 4-Cut", desc: "Popular Preset Layouts", icon: <Layers className="w-4 h-4 text-pink-400" /> },
              { title: "Purikura Tools", desc: "Glitter, Neon & Stickers", icon: <Palette className="w-4 h-4 text-purple-400" /> },
              { title: "DeepSeek AI", desc: "Smart Meme Generator", icon: <Sparkles className="w-4 h-4 text-cyan-400" /> },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm text-left flex flex-col justify-between"
              >
                <div className="p-2 w-fit rounded-xl bg-zinc-800/60 mb-2">{item.icon}</div>
                <div>
                  <div className="text-base font-bold text-white">{item.title}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Layout Presets */}
      <section className="py-16 bg-zinc-950/40 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <Badge variant="brand" className="mb-2">
                Layout Engine
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Choose Your Strip Format</h2>
              <p className="text-sm text-zinc-400 mt-1">
                Dynamic JSON-driven layouts ready for instant camera shooting.
              </p>
            </div>
            <Link href="/booth">
              <Button variant="outline" size="sm">
                View All Layouts
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DEFAULT_LAYOUTS.map((layout) => (
              <Card
                key={layout.id}
                variant="interactive"
                className="flex flex-col justify-between group overflow-hidden border-zinc-800"
              >
                <div>
                  <div className="w-full aspect-[3/4] bg-zinc-950 rounded-xl p-3 border border-zinc-800/80 mb-4 flex flex-col justify-center items-center relative overflow-hidden group-hover:border-brand-500/50 transition-colors">
                    <div className="w-full h-full flex flex-col gap-1.5 p-2 bg-zinc-900 rounded-lg shadow-inner">
                      {layout.slots.slice(0, 4).map((slot, sIdx) => (
                        <div
                          key={sIdx}
                          className="w-full flex-1 bg-zinc-800/80 rounded border border-dashed border-zinc-700/60 flex items-center justify-center text-[10px] text-zinc-500 font-mono"
                        >
                          Cut {sIdx + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                  <h3 className="font-bold text-base text-white">{layout.name}</h3>
                  <p className="text-xs text-zinc-400 mt-1 font-mono">Ratio {layout.aspectRatio}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className="text-xs text-zinc-400">{layout.slots.length} shots</span>
                  <Link href={`/booth?layout=${layout.slug}`}>
                    <Button variant="ghost" size="sm" className="text-brand-400 p-0 hover:bg-transparent">
                      Shoot &rarr;
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
