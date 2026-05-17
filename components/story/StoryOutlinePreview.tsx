"use client";

import { BookOpen, ChevronRight, Users, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type StoryOutline } from '@/lib/types';
import { getAgeGroupLabel, getBookSizeLabel, getLearningFocusLabel } from '@/lib/utils';

interface StoryOutlinePreviewProps {
  outline: StoryOutline;
  onConfirm: () => void;
  onBack: () => void;
  isGenerating?: boolean;
}

export function StoryOutlinePreview({ outline, onConfirm, onBack, isGenerating = false }: StoryOutlinePreviewProps) {
  return (
    <div className="section-shell py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-bloom-teal">Step 2 of 3</p>
          <h1 className="mt-2 text-4xl font-semibold text-bloom-ink">Your story outline is ready</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Review the plan below. When you&rsquo;re happy with it, click Generate to craft the full illustrated book.
          </p>
        </div>

        <div className="space-y-5">
          {/* Title + Summary */}
          <Card>
            <CardHeader>
              <div className="flex flex-wrap gap-2">
                <Badge variant="plum">{outline.theme}</Badge>
                <Badge variant="teal">{getAgeGroupLabel(outline.ageGroup)}</Badge>
                <Badge variant="gold">{getLearningFocusLabel(outline.learningFocus)}</Badge>
                <Badge variant="outline">{getBookSizeLabel(outline.bookSize)}</Badge>
                <Badge variant="outline">{outline.pageCount} pages</Badge>
              </div>
              <CardTitle className="mt-4 text-3xl">{outline.title}</CardTitle>
              {outline.subtitle ? <p className="mt-1 text-base leading-7 text-slate-600 italic">{outline.subtitle}</p> : null}
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl bg-bloom-cream/60 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-bloom-teal" />
                  <p className="text-sm font-semibold text-bloom-ink">Story Summary</p>
                </div>
                <p className="text-sm leading-7 text-slate-700">{outline.summary}</p>
              </div>
            </CardContent>
          </Card>

          {/* Characters */}
          {outline.characters.length > 0 ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-bloom-plum" />
                  <CardTitle>Characters</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {outline.characters.map((character) => (
                    <div key={character.name} className="rounded-2xl border border-bloom-plum/10 bg-bloom-cream/40 p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">✦</span>
                        <p className="font-semibold text-bloom-ink">{character.name}</p>
                        <Badge variant="outline" className="ml-auto text-xs">{character.role}</Badge>
                      </div>
                      {character.appearance ? (
                        <p className="mt-2 text-sm leading-6 text-slate-600">{character.appearance}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Page outlines */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-bloom-plum" />
                <CardTitle>Chapter by Chapter</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-bloom-plum/8">
                {outline.pageOutlines.map((page) => (
                  <div key={page.pageNumber} className="flex items-start gap-4 py-3 first:pt-0 last:pb-0">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bloom-plum/10 text-xs font-bold text-bloom-plum">
                      {page.pageNumber}
                    </span>
                    <div>
                      {page.title ? <p className="font-semibold text-bloom-ink">{page.title}</p> : null}
                      {page.summary ? <p className="mt-0.5 text-sm leading-6 text-slate-600">{page.summary}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] bg-gradient-to-r from-bloom-plum/10 via-bloom-teal/10 to-white p-6">
            <div>
              <p className="font-semibold text-bloom-ink">Love what you see?</p>
              <p className="mt-1 text-sm text-slate-600">Generate the full illustrated story with artwork for every page.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={onBack} disabled={isGenerating}>
                Change details
              </Button>
              <Button size="lg" onClick={onConfirm} disabled={isGenerating}>
                {isGenerating ? 'Generating…' : 'Generate Story'}
                {!isGenerating ? <ChevronRight className="h-4 w-4" /> : null}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
