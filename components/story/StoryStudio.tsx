"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Globe, Lock, Eye, Download, RefreshCw, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { IllustrationImage } from '@/components/story/IllustrationImage';
import { type Story, type StoryPageDraft } from '@/lib/types';
import { getAgeGroupLabel, getLearningFocusLabel, getBookSizeLabel } from '@/lib/utils';

interface StoryStudioProps {
  story: Story;
}

type SelectedPage = 'cover' | number;

export function StoryStudio({ story }: StoryStudioProps) {
  const [title, setTitle] = useState(story.title);
  const [synopsis, setSynopsis] = useState(story.content.split('\n\n--- PAGE ---\n\n')[0] ?? story.content.slice(0, 500));
  const [isPublic, setIsPublic] = useState(story.isPublic);
  const [selectedPage, setSelectedPage] = useState<SelectedPage>('cover');
  const [pageTexts, setPageTexts] = useState<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    story.bookPages?.forEach((page) => { map[page.pageNumber] = page.text; });
    return map;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const pages: StoryPageDraft[] = story.bookPages?.length
    ? story.bookPages
    : story.content
        .split(/\n\n--- PAGE ---\n\n/)
        .filter(Boolean)
        .map((text, index) => ({
          pageNumber: index + 1,
          text,
          illustrationPrompt: '',
        }));
  const currentPageData = selectedPage !== 'cover' ? pages.find((p) => p.pageNumber === selectedPage) : null;

  async function handleSave() {
    setIsSaving(true);
    setSaveMessage(null);

    const updatedContent = pages.length > 0
      ? pages.map((p) => `Page ${p.pageNumber}\n\n${pageTexts[p.pageNumber] ?? p.text}`).join('\n\n--- PAGE ---\n\n')
      : synopsis;

    try {
      const response = await fetch(`/api/stories/${story.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content: updatedContent, isPublic }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? 'Unable to save changes.');
      }

      setSaveMessage('Saved successfully.');
      window.location.reload();
    } catch (err) {
      setSaveMessage(err instanceof Error ? err.message : 'Unable to save changes.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-slate-100">
      {/* Top bar */}
      <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-5 py-3">
        <Link href="/stories" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">
          <X className="h-5 w-5" />
        </Link>
        <BookIcon />
        <span className="max-w-[200px] truncate text-sm font-semibold text-bloom-ink">{title}</span>

        {/* Public/private toggle */}
        <div className="ml-4 flex items-center gap-2">
          <Lock className={`h-4 w-4 ${isPublic ? 'text-slate-400' : 'text-bloom-plum'}`} />
          <button
            type="button"
            role="switch"
            aria-checked={isPublic}
            onClick={() => setIsPublic((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPublic ? 'bg-bloom-teal' : 'bg-slate-300'}`}
          >
            <span className={`inline-block h-4 w-4 translate-x-1 rounded-full bg-white shadow transition-transform ${isPublic ? 'translate-x-6' : ''}`} />
          </button>
          <Globe className={`h-4 w-4 ${isPublic ? 'text-bloom-teal' : 'text-slate-400'}`} />
          <span className="text-xs font-medium text-slate-600">{isPublic ? 'Public' : 'Private'}</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link href={`/stories/${story.id}`}>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          </Link>
          <Link href={`/api/stories/${story.id}/export?format=pdf`}>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </Link>
          <Link href={`/stories/new`}>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
              Regenerate Story
            </Button>
          </Link>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      {saveMessage ? (
        <div className="shrink-0 bg-bloom-teal/10 px-5 py-2 text-sm font-medium text-bloom-teal">{saveMessage}</div>
      ) : null}

      {/* Main layout */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left sidebar - page list */}
        <aside className="flex w-64 shrink-0 flex-col gap-2 overflow-y-auto border-r border-slate-200 bg-white p-3">
          <p className="px-2 pt-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Pages</p>

          {/* Cover */}
          <button
            type="button"
            onClick={() => setSelectedPage('cover')}
            className={`flex items-start gap-3 rounded-xl p-3 text-left transition ${selectedPage === 'cover' ? 'border border-bloom-plum bg-bloom-cream/70' : 'border border-transparent hover:bg-slate-50'}`}
          >
            {story.coverImageUrl ? (
              <img src={story.coverImageUrl} alt="Cover" className="h-12 w-10 rounded-lg object-cover" />
            ) : (
              <div className="flex h-12 w-10 items-center justify-center rounded-lg bg-bloom-plum/10 text-bloom-plum text-xl">📖</div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-bloom-ink">Cover &amp; Synopsis</p>
              <p className="mt-0.5 truncate text-xs text-slate-500">Edit cover image and story overview</p>
            </div>
          </button>

          {/* Pages */}
          {pages.map((page) => (
            <button
              key={page.pageNumber}
              type="button"
              onClick={() => setSelectedPage(page.pageNumber)}
              className={`flex items-start gap-3 rounded-xl p-3 text-left transition ${selectedPage === page.pageNumber ? 'border border-bloom-plum bg-bloom-cream/70' : 'border border-transparent hover:bg-slate-50'}`}
            >
              {page.imageUrl ? (
                <img src={page.imageUrl} alt={`Page ${page.pageNumber}`} className="h-12 w-10 rounded-lg object-cover" />
              ) : (
                <div className="flex h-12 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                  {page.pageNumber}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-bloom-ink">Page {page.pageNumber}</p>
                <p className="mt-0.5 truncate text-xs text-slate-500">{(pageTexts[page.pageNumber] ?? page.text).slice(0, 40)}…</p>
              </div>
            </button>
          ))}
        </aside>

        {/* Center content area */}
        <main className="flex flex-1 overflow-y-auto">
          {selectedPage === 'cover' ? (
            <div className="mx-auto w-full max-w-5xl p-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Synopsis */}
                <div className="space-y-3">
                  <label className="block space-y-2 text-sm font-semibold text-bloom-ink">
                    Story Title
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" />
                  </label>
                  <label className="block space-y-2 text-sm font-semibold text-bloom-ink">
                    Story Synopsis
                    <Textarea
                      className="mt-1 min-h-[240px]"
                      value={synopsis}
                      onChange={(e) => setSynopsis(e.target.value)}
                    />
                  </label>
                  <p className="text-xs text-slate-500">This synopsis helps guide the overall story theme and character consistency.</p>
                </div>

                {/* Cover image */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-bloom-ink">Cover Image</p>
                  {story.coverImageUrl ? (
                    <div className="overflow-hidden rounded-2xl border border-slate-200">
                      <IllustrationImage
                        src={story.coverImageUrl}
                        alt="Cover"
                        className="h-auto w-full object-cover"
                        placeholderClassName="flex h-[280px] items-center justify-center bg-slate-100 text-sm text-slate-500"
                      />
                    </div>
                  ) : (
                    <div className="flex h-[280px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                      No cover image generated yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Meta row */}
              <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm sm:grid-cols-4">
                <div><p className="text-slate-500">Age Group</p><p className="mt-1 font-semibold text-bloom-ink">{getAgeGroupLabel(story.ageGroup)}</p></div>
                <div><p className="text-slate-500">Focus Topic</p><p className="mt-1 font-semibold text-bloom-ink">{story.learningFocus ? getLearningFocusLabel(story.learningFocus) : '—'}</p></div>
                <div><p className="text-slate-500">Book Size</p><p className="mt-1 font-semibold text-bloom-ink">{story.bookSize ? getBookSizeLabel(story.bookSize) : '—'}</p></div>
                <div><p className="text-slate-500">Pages</p><p className="mt-1 font-semibold text-bloom-ink">{story.pageCount ?? pages.length}</p></div>
              </div>
            </div>
          ) : currentPageData ? (
            <div className="mx-auto w-full max-w-5xl p-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Page text editor */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-bloom-ink">Page {currentPageData.pageNumber} Text</p>
                  <Textarea
                    className="min-h-[320px]"
                    value={pageTexts[currentPageData.pageNumber] ?? currentPageData.text}
                    onChange={(e) => setPageTexts((prev) => ({ ...prev, [currentPageData.pageNumber]: e.target.value }))}
                  />
                  <p className="text-xs text-slate-500">Illustration prompt: {currentPageData.illustrationPrompt.slice(0, 120)}…</p>
                </div>

                {/* Page illustration */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-bloom-ink">Page Illustration</p>
                  {currentPageData.imageUrl ? (
                    <div className="overflow-hidden rounded-2xl border border-slate-200">
                      <IllustrationImage
                        src={currentPageData.imageUrl}
                        alt={`Illustration for page ${currentPageData.pageNumber}`}
                        className="h-auto w-full object-cover"
                        placeholderClassName="flex h-[280px] items-center justify-center bg-slate-100 text-sm text-slate-500"
                      />
                    </div>
                  ) : (
                    <div className="flex h-[280px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                      No illustration for this page.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function BookIcon() {
  return <span className="text-bloom-plum">📚</span>;
}
