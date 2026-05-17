"use client";

import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { Compass, LayoutDashboard, PlusCircle, ScrollText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const navigationItems = [
  {
    href: '/dashboard',
    label: 'Story Home',
    icon: LayoutDashboard,
  },
  {
    href: '/stories',
    label: 'My Story Shelf',
    icon: ScrollText,
  },
  {
    href: '/stories/new',
    label: 'Create Story',
    icon: PlusCircle,
  },
  {
    href: '/stories/discover',
    label: 'Discover',
    icon: Compass,
  },
] as const;

function BloomIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-10 w-10">
      <circle cx="32" cy="32" r="8" fill="#ffd166" />
      <ellipse cx="32" cy="14" rx="10" ry="14" fill="#9d8cf4" />
      <ellipse cx="48" cy="24" rx="10" ry="14" fill="#71d6cf" transform="rotate(40 48 24)" />
      <ellipse cx="46" cy="44" rx="10" ry="14" fill="#ff8b7b" transform="rotate(80 46 44)" />
      <ellipse cx="18" cy="42" rx="10" ry="14" fill="#ffd166" transform="rotate(130 18 42)" />
      <ellipse cx="16" cy="22" rx="10" ry="14" fill="#1e8f92" transform="rotate(-35 16 22)" />
    </svg>
  );
}

interface NavbarProps {
  isClerkConfigured: boolean;
}

export function Navbar({ isClerkConfigured }: NavbarProps) {
  const authControl = isClerkConfigured ? (
    <UserButton afterSignOutUrl="/sign-in" />
  ) : (
    <Badge variant="outline" className="normal-case tracking-[0.08em]">
      Auth setup required
    </Badge>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/75 backdrop-blur-xl">
      <div className="section-shell flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link href="/dashboard" className="flex items-center gap-3" aria-label="Go to dashboard">
            <BloomIcon />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-bloom-teal">MindBloom</p>
              <p className="text-sm text-slate-600">Stories kids ask for again</p>
            </div>
          </Link>
          <div className="lg:hidden">{authControl}</div>
        </div>

        <nav className="flex flex-wrap items-center gap-2" aria-label="Primary navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-bloom-cream hover:text-bloom-ink"
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="hidden lg:block lg:pl-2">{authControl}</div>
        </nav>
      </div>
    </header>
  );
}
