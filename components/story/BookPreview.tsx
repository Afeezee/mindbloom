"use client";

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Palette, Sparkles, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IllustrationImage } from '@/components/story/IllustrationImage';
import { type BookDraft } from '@/lib/types';
import { getAgeGroupLabel, getBookLengthLabel, getBookSizeLabel, getLearningFocusLabel } from '@/lib/utils';

interface BookPreviewProps {
  draft: BookDraft | null;
  isGenerating?: boolean;
}

export function BookPreview({ draft, isGenerating = false }: BookPreviewProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const page = draft?.pages[currentPage];
  const totalPages = draft?.pages.length ?? 0;

  const pageSummary = useMemo(() => {
    if (!draft) {
      return null;
    }

    return `${getBookLengthLabel(draft.pageCount)} • ${draft.pageCount} pages`;
  }, [draft]);

  if (!draft) {
    return (
      <Card className="h-full border-white/90 bg-white/90">
        <CardHeader>
          <CardTitle>Preview your book</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-[460px] items-center justify-center rounded-[1.75rem] border border-dashed border-bloom-plum/20 bg-bloom-cream/70 p-8 text-center text-slate-500">
            {isGenerating ? 'Preparing page-by-page book preview...' : 'Your illustrated book preview will appear here.'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full overflow-hidden border-white/90 bg-white/90">
      <CardHeader className="bg-gradient-to-r from-bloom-plum via-[#7f70df] to-bloom-teal text-white">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-white/20 text-white" variant="outline">
            {getAgeGroupLabel(draft.ageGroup)}
          </Badge>
          <Badge className="bg-white/20 text-white" variant="outline">
            {getLearningFocusLabel(draft.learningFocus)}
          </Badge>
          <Badge className="bg-white/20 text-white" variant="outline">
            {getBookSizeLabel(draft.bookSize)}
          </Badge>
        </div>
        <CardTitle className="mt-5 text-3xl md:text-4xl">{draft.title}</CardTitle>
        <p className="max-w-2xl text-sm leading-7 text-white/80">{draft.subtitle}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/75">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1">
            <Sparkles className="h-3.5 w-3.5" />
            {pageSummary}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1">
            <Palette className="h-3.5 w-3.5" />
            {draft.artDirection}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1">
            <Users className="h-3.5 w-3.5" />
            {draft.characters.length} characters
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 p-6">
        <div className="rounded-[1.75rem] bg-slate-950 px-6 py-6 text-white shadow-soft">
          <div className="mb-4 flex items-center justify-between text-sm text-white/70">
            <span>
              Page {currentPage + 1} of {totalPages}
            </span>
            <span>{draft.readingLevel}</span>
          </div>
          {page?.imageUrl ? (
            <IllustrationImage
              src={page.imageUrl}
              alt={`Illustration for page ${page.pageNumber}`}
              className="mb-4 h-auto w-full rounded-2xl border border-white/10 object-cover"
              placeholderClassName="mb-4 flex h-[280px] w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm text-white/70"
            />
          ) : (
            <div className="mb-4 flex h-[280px] w-full items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 text-sm text-white/70">
              Illustration not scheduled for this page in the current generation scope.
            </div>
          )}
          <p className="whitespace-pre-wrap text-lg leading-8">{page?.text}</p>
          <div className="mt-4 rounded-2xl bg-white/5 p-4 text-sm text-white/70">
            <p className="font-semibold text-white/90">Illustration prompt</p>
            <p className="mt-1 leading-6">{page?.illustrationPrompt}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((value) => Math.max(0, value - 1))}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous page
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            {draft.pages.slice(0, 8).map((item, index) => (
              <button
                key={item.pageNumber}
                className={`h-2.5 w-2.5 rounded-full transition ${index === currentPage ? 'bg-bloom-plum' : 'bg-bloom-plum/25'}`}
                onClick={() => setCurrentPage(index)}
                type="button"
                aria-label={`Jump to page ${item.pageNumber}`}
              />
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((value) => Math.min(totalPages - 1, value + 1))}
            disabled={currentPage >= totalPages - 1}
          >
            Next page
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-[1.5rem] bg-bloom-cream/80 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Summary</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{draft.summary}</p>
          </div>
          <div className="rounded-[1.5rem] bg-bloom-cream/80 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Cover prompt</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{draft.coverImagePrompt}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
