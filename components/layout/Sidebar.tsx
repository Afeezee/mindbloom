"use client";

import Link from 'next/link';
import { Compass, LayoutDashboard, Sparkles, Stars, ScrollText } from 'lucide-react';

const items = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/stories', label: 'Story Library', icon: ScrollText },
  { href: '/stories/new', label: 'Write a Story', icon: Sparkles },
] as const;

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-white/50 bg-white/55 px-6 py-8 backdrop-blur-xl xl:flex xl:flex-col">
      <div className="rounded-4xl bg-gradient-to-br from-bloom-plum via-[#7463d7] to-bloom-teal p-6 text-white shadow-bloom">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
          <Compass className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-semibold">Story Studio</h2>
        <p className="mt-2 text-sm leading-6 text-white/80">
          Draft sweet adventures, save family favorites, and keep every story in one playful home.
        </p>
      </div>

      <nav className="mt-8 space-y-2" aria-label="Sidebar navigation">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-white/80 hover:text-bloom-ink"
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-4xl border border-bloom-gold/50 bg-bloom-gold/25 p-5 text-sm text-bloom-ink shadow-soft">
        <div className="mb-3 flex items-center gap-2 font-semibold">
          <Stars className="h-4 w-4 text-bloom-plum" />
          MindBloom Tip
        </div>
        <p className="leading-6 text-slate-700">
          Specific characters, cozy settings, and one surprising detail almost always lead to richer story generations.
        </p>
      </div>
    </aside>
  );
}
