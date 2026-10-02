import React from "react";
import Link from "next/link";
import { Camera, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800/80 bg-zinc-950/60 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center shadow-glow">
            <Camera className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white">AI PHOTO BOOTH & MEME STUDIO</span>
            <p className="text-xs text-zinc-400">Korean 4-Cut, Purikura & AI Creativity Studio</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-zinc-400">
          <Link href="/booth" className="hover:text-white transition">Booth</Link>
          <Link href="/explore" className="hover:text-white transition">Templates</Link>
          <Link href="/ai-studio" className="hover:text-white transition">AI Studio</Link>
          <Link href="/gallery" className="hover:text-white transition">Gallery</Link>
          <Link href="/events" className="hover:text-white transition">Events</Link>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>for viral moments</span>
        </div>
      </div>
    </footer>
  );
}
