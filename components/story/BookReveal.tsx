"use client";

import Link from 'next/link';
import { CheckCircle2, Edit3, PlusCircle, Users, BookOpen, Palette, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IllustrationImage } from '@/components/story/IllustrationImage';
import { type BookDraft } from '@/lib/types';
import { getAgeGroupLabel, getBookSizeLabel, getLearningFocusLabel } from '@/lib/utils';

interface BookRevealProps {
  draft: BookDraft;
  savedStoryId: string;
  coverImageUrl: string;
  onCreateAnother: () => void;
}

const STAT_ICONS: Record<string, React.ReactNode> = {
  age: <Users className="h-6 w-6" />,
  focus: <Palette className="h-6 w-6" />,
  pages: <BookOpen className="h-6 w-6" />,
  art: <Palette className="h-6 w-6" />,
  size: <Ruler className="h-6 w-6" />,
};

export function BookReveal({ draft, savedStoryId, coverImageUrl, onCreateAnother }: BookRevealProps) {
  return (
    <div className="section-shell py-10">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 rounded-[1.5rem] bg-gradient-to-r from-bloom-teal/20 to-white px-6 py-5 text-center">
          <div className="mb-3 flex items-center justify-center gap-3">
            <span className="text-3xl">🎉</span>
            <h1 className="text-3xl font-semibold text-bloom-ink">Your Story is Ready!</h1>
          </div>
          <p className="text-sm leading-7 text-slate-600">Your magical children&rsquo;s book has been created and saved to your library.</p>
        </div>

        {/* Cover art */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-bloom-plum/15 shadow-bloom">
            <IllustrationImage
              src={coverImageUrl}
              alt={`Cover illustration for ${draft.title}`}
              className="h-auto w-full object-cover"
              placeholderClassName="flex h-[320px] w-full items-center justify-center bg-bloom-cream/80 text-sm text-slate-500"
            />
          </div>

          <h2 className="mt-6 text-center text-3xl font-semibold text-bloom-ink">{draft.title}</h2>
          <p className="mt-2 max-w-md text-center text-sm leading-7 text-slate-600">{draft.summary}</p>
        </div>

        {/* Stats row */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { key: 'age', label: 'Target Age', value: getAgeGroupLabel(draft.ageGroup) },
            { key: 'focus', label: 'Learning Focus', value: getLearningFocusLabel(draft.learningFocus) },
            { key: 'pages', label: 'Story Length', value: `${draft.pageCount} Pages` },
            { key: 'art', label: 'Art Style', value: draft.artDirection.split(',')[0]?.trim() ?? 'Illustrated' },
            { key: 'size', label: 'Book Size', value: getBookSizeLabel(draft.bookSize) },
          ].map((stat) => (
            <div
              key={stat.key}
              className="flex flex-col items-center gap-2 rounded-2xl border border-bloom-plum/10 bg-white p-4 text-center"
            >
              <span className="text-bloom-plum">{STAT_ICONS[stat.key]}</span>
              <p className="text-sm font-semibold text-bloom-ink">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Story complete badge */}
        <div className="mt-6 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-bloom-teal/15 px-5 py-2.5 text-sm font-semibold text-bloom-teal">
            <CheckCircle2 className="h-4 w-4" />
            Story Complete
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href={`/stories/${savedStoryId}/edit`}>
            <Button size="lg">
              <Edit3 className="h-4 w-4" />
              Edit &amp; Customize
            </Button>
          </Link>
          <Button variant="outline" size="lg" onClick={onCreateAnother}>
            <PlusCircle className="h-4 w-4" />
            Create Another Story
          </Button>
        </div>
      </div>
    </div>
  );
}
