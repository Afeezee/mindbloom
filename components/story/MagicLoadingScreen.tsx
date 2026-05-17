"use client";

import { useEffect, useState } from 'react';
import { BookOpen, Palette, Sparkles, Wand2 } from 'lucide-react';

interface MagicLoadingScreenProps {
  phase: 'outline' | 'book';
}

const OUTLINE_STEPS = [
  { icon: BookOpen, label: 'Reading your idea', delay: 0 },
  { icon: Sparkles, label: 'Designing characters', delay: 600 },
  { icon: Wand2, label: 'Shaping the outline', delay: 1200 },
];

const BOOK_STEPS = [
  { icon: BookOpen, label: 'Writing story', delay: 0 },
  { icon: Palette, label: 'Designing art', delay: 700 },
  { icon: Sparkles, label: 'Adding magic', delay: 1400 },
];

export function MagicLoadingScreen({ phase }: MagicLoadingScreenProps) {
  const steps = phase === 'outline' ? OUTLINE_STEPS : BOOK_STEPS;
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="flex min-h-[80dvh] flex-col items-center justify-center bg-gradient-to-b from-bloom-cream/50 to-white px-6 py-12 text-center">
      <div className="relative mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-bloom-plum to-bloom-teal shadow-bloom">
        <Wand2 className="h-12 w-12 animate-pulse text-white" />
        <span className="absolute -right-1 -top-1 text-2xl">✦</span>
      </div>

      <h1 className="text-3xl font-semibold text-bloom-ink md:text-4xl">
        {phase === 'outline' ? 'Planning your story…' : 'Creating Magic…'}
        <span className="ml-2 text-2xl">✦</span>
      </h1>

      <p className="mt-3 max-w-md text-base leading-7 text-slate-600">
        {phase === 'outline'
          ? 'We\'re planning out your story structure and characters. Just a moment!'
          : 'Crafting your story and illustrations… This might take a moment!'}
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === activeStep;

          return (
            <div
              key={step.label}
              className={`flex flex-col items-center gap-3 transition-all duration-500 ${isActive ? 'scale-110 opacity-100' : 'scale-95 opacity-50'}`}
            >
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-colors duration-500 ${
                  isActive ? 'bg-bloom-plum/15 shadow-bloom' : 'bg-slate-100'
                }`}
              >
                <Icon className={`h-7 w-7 transition-colors duration-500 ${isActive ? 'text-bloom-plum' : 'text-slate-400'}`} />
              </div>
              <span className="text-sm font-semibold text-slate-600">{step.label}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-12 flex items-center gap-2">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className={`block h-3 w-3 rounded-full transition-all duration-500 ${
              index === activeStep % 3
                ? 'scale-110 bg-bloom-plum'
                : index === (activeStep + 1) % 3
                  ? 'bg-bloom-teal'
                  : 'bg-bloom-coral'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
