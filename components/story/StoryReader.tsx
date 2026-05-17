"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Heart, Share2, ArrowLeft, ChevronLeft, ChevronRight, Volume2, Square, FileText, FileDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IllustrationImage } from '@/components/story/IllustrationImage';
import { PdfExportModal } from '@/components/story/PdfExportModal';
import { type Story, type StoryPageDraft } from '@/lib/types';
import { formatDate, getAgeGroupLabel, getBookSizeLabel, getLearningFocusLabel } from '@/lib/utils';

interface StoryReaderProps {
  story: Story;
  canLike?: boolean;
  backHref?: string;
  publicUrl?: string;
}

export function StoryReader({ story, canLike = true, backHref = '/stories', publicUrl }: StoryReaderProps) {
  const [likeCount, setLikeCount] = useState(story.likeCount);
  const [liked, setLiked] = useState(Boolean(story.likedByCurrentUser));
  const [isLiking, setIsLiking] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isPreparingViewer, setIsPreparingViewer] = useState(true);
  const [readyProgress, setReadyProgress] = useState<{ done: number; total: number }>({ done: 0, total: 0 });
  const [isNarrating, setIsNarrating] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [isPreparingPdfPreview, setIsPreparingPdfPreview] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const pages = useMemo<StoryPageDraft[]>(() => {
    if (story.bookPages?.length) {
      return story.bookPages;
    }

    const storyPages = story.content.split(/\n\n--- PAGE ---\n\n/).filter(Boolean);

    if (storyPages.length > 0) {
      return storyPages.map((text, index) => ({
        pageNumber: index + 1,
        text,
        illustrationPrompt: '',
      }));
    }

    return story.content.split(/\n{2,}/).filter(Boolean).map((text, index) => ({
      pageNumber: index + 1,
      text,
      illustrationPrompt: '',
    }));
  }, [story.bookPages, story.content]);

  const currentPageDraft = pages[currentPage] ?? pages[0] ?? { pageNumber: 1, text: story.content, illustrationPrompt: '' };
  const coverImage = story.coverImageUrl ?? pages[0]?.imageUrl;
  const isLastPage = currentPage >= pages.length - 1;
  const pageNarrationText = `${story.title}. Page ${currentPageDraft.pageNumber}. ${currentPageDraft.text}`;

  function closePdfPreview() {
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
    }

    setPdfPreviewUrl(null);
    setIsPreparingPdfPreview(false);
  }

  async function handlePdfPreview() {
    try {
      setIsPreparingPdfPreview(true);
      const response = await fetch(`/api/stories/${story.id}/export?format=pdf`);

      if (!response.ok) {
        throw new Error('Unable to prepare the PDF preview right now.');
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }

      setPdfPreviewUrl(objectUrl);
    } catch (error) {
      setShareMessage(error instanceof Error ? error.message : 'Unable to export the story.');
      setIsPreparingPdfPreview(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function preloadMedia() {
      const mediaSources = [coverImage, currentPageDraft.imageUrl].filter((value): value is string => Boolean(value));

      if (mediaSources.length === 0) {
        setIsPreparingViewer(false);
        return;
      }

      setReadyProgress({ done: 0, total: mediaSources.length });

      for (let index = 0; index < mediaSources.length; index += 1) {
        const source = mediaSources[index];

        await new Promise<void>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve();
          image.onerror = () => reject(new Error('Failed to load story media.'));
          image.src = source;
        });

        if (cancelled) {
          return;
        }

        setReadyProgress({ done: index + 1, total: mediaSources.length });
      }

      if (!cancelled) {
        setIsPreparingViewer(false);
        setReadyProgress({ done: mediaSources.length, total: mediaSources.length });
      }
    }

    preloadMedia().catch((error) => {
      if (!cancelled) {
        setShareMessage(error instanceof Error ? error.message : 'Unable to prepare story media.');
        setIsPreparingViewer(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [coverImage, currentPageDraft.imageUrl]);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function startNarration() {
    if (!('speechSynthesis' in window)) {
      setShareMessage('Audio narration is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(pageNarrationText);
    utterance.rate = story.ageGroup === '3-5' ? 0.85 : story.ageGroup === '6-8' ? 0.95 : 1;
    utterance.pitch = 1.02;
    utterance.onend = () => {
      setIsNarrating(false);
    };
    utterance.onerror = () => {
      setIsNarrating(false);
      setShareMessage('Narration could not be played on this device.');
    };

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsNarrating(true);
  }

  function stopNarration() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setIsNarrating(false);
  }

  async function handleLike() {
    if (!canLike || isLiking) {
      return;
    }

    setIsLiking(true);

    try {
      const response = await fetch(`/api/stories/${story.id}/like`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Unable to update likes right now.');
      }

      const payload = (await response.json()) as { liked: boolean; likeCount: number };
      setLiked(payload.liked);
      setLikeCount(payload.likeCount);
    } catch (error) {
      setShareMessage(error instanceof Error ? error.message : 'Unable to update likes.');
    } finally {
      setIsLiking(false);
    }
  }

  async function handleShare() {
    const shareTarget = publicUrl ? new URL(publicUrl, window.location.origin).toString() : window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: story.title,
          text: `Read ${story.title} on MindBloom`,
          url: shareTarget,
        });
      } else {
        await navigator.clipboard.writeText(shareTarget);
        setShareMessage('Link copied to clipboard.');
      }
    } catch {
      setShareMessage('Sharing was cancelled.');
    }
  }

  function handleBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
      return;
    }

    if (typeof window !== 'undefined') {
      window.location.href = backHref;
    }
  }

  if (isPreparingViewer) {
    return (
      <article className="min-h-[100dvh] w-full bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center rounded-3xl border border-white/15 bg-white/5 p-10 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-white/70">Preparing Story Viewer</p>
          <h1 className="mt-3 text-3xl font-semibold">Loading illustrations and text...</h1>
          <p className="mt-3 text-white/75">
            {readyProgress.total > 0 ? `Loaded ${readyProgress.done} of ${readyProgress.total} media assets.` : 'Preparing your immersive book experience.'}
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="min-h-[100dvh] w-full bg-slate-100 px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto h-full max-w-[1400px] overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-soft">
        <div className="bg-gradient-to-r from-bloom-plum via-[#7f70df] to-bloom-teal px-8 py-10 text-white">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-white/20 text-white" variant="outline">
              {story.theme}
            </Badge>
            <Badge className="bg-white/20 text-white" variant="outline">
              {getAgeGroupLabel(story.ageGroup)}
            </Badge>
            {story.learningFocus ? (
              <Badge className="bg-white/20 text-white" variant="outline">
                {getLearningFocusLabel(story.learningFocus)}
              </Badge>
            ) : null}
            {story.bookSize ? (
              <Badge className="bg-white/20 text-white" variant="outline">
                {getBookSizeLabel(story.bookSize)}
              </Badge>
            ) : null}
            <Badge className="bg-white/20 text-white" variant="outline">
              {formatDate(story.createdAt)}
            </Badge>
          </div>
          <h1 className="mt-5 text-4xl font-semibold md:text-5xl">{story.title}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80">
            {story.wordCount} words{story.pageCount ? ` • ${story.pageCount} pages` : ''} • Crafted for gentle reading, strong imagination, and cozy repeat visits.
          </p>
          {coverImage ? (
            <div className="mt-6 max-w-3xl rounded-3xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/70">Cover Illustration</p>
              <IllustrationImage
                src={coverImage}
                alt={`Cover illustration for ${story.title}`}
                className="h-auto w-full rounded-2xl border border-white/20 object-cover"
                placeholderClassName="hidden"
                loading="eager"
              />
            </div>
          ) : null}
        </div>

        <div className="px-6 py-6 sm:px-8">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Link href={backHref} className="text-sm font-semibold text-bloom-plum">
              Or return to the library
            </Link>
            <div className="ml-auto flex flex-wrap items-center gap-3">
              <Button variant={liked ? 'primary' : 'outline'} onClick={handleLike} disabled={!canLike || isLiking}>
                <Heart className="h-4 w-4" />
                {likeCount}
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" onClick={isNarrating ? stopNarration : startNarration}>
                {isNarrating ? <Square className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                {isNarrating ? 'Stop narration' : 'Narrate page'}
              </Button>
              <Button variant="outline" onClick={handlePdfPreview} disabled={isPreparingPdfPreview}>
                <FileDown className="h-4 w-4" />
                {isPreparingPdfPreview ? 'Preparing PDF…' : 'Preview PDF'}
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/stories/${story.id}/export?format=docx`);

                    if (!response.ok) {
                      throw new Error('Unable to export DOCX right now.');
                    }

                    const blob = await response.blob();
                    const objectUrl = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = objectUrl;
                    link.download = `${story.title.replace(/[^a-z0-9_-]/gi, '_')}.docx`;
                    link.click();
                    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
                  } catch (error) {
                    setShareMessage(error instanceof Error ? error.message : 'Unable to export the story.');
                  }
                }}
              >
                <FileText className="h-4 w-4" />
                Export DOCX
              </Button>
            </div>
          </div>

          {shareMessage ? <p className="mb-5 text-sm text-slate-600">{shareMessage}</p> : null}

          <div className="story-prose mx-auto max-w-3xl rounded-[2rem] bg-gradient-to-b from-bloom-cream/60 to-white p-6 md:p-10">
            <div className="mb-5 flex items-center justify-between gap-3">
              <Button variant="outline" onClick={() => setCurrentPage((value) => Math.max(0, value - 1))} disabled={currentPage === 0}>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="text-sm font-semibold text-bloom-ink">
                Page {Math.min(currentPage + 1, pages.length)} of {pages.length}
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((value) => Math.min(pages.length - 1, value + 1))}
                disabled={currentPage >= pages.length - 1}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="mb-3 text-sm font-semibold text-slate-600">{publicUrl ? 'Public preview' : 'Private reader'}</p>
            <div className="rounded-[1.75rem] bg-white p-6 shadow-soft md:p-8">
              {currentPageDraft.imageUrl ? (
                <IllustrationImage
                  src={currentPageDraft.imageUrl}
                  alt={`Illustration for page ${currentPageDraft.pageNumber}`}
                  className="mb-5 h-auto w-full rounded-2xl border border-bloom-plum/10 object-cover"
                  placeholderClassName="mb-5 flex h-[280px] w-full items-center justify-center rounded-2xl border border-bloom-plum/10 bg-bloom-cream/60 text-sm text-slate-600"
                  loading="eager"
                />
              ) : null}
              <p className="whitespace-pre-wrap text-pretty leading-8 text-bloom-ink">{currentPageDraft.text}</p>
              {isLastPage ? (
                <p className="mt-6 text-center text-xl font-bold tracking-[0.3em] text-bloom-plum">THE END</p>
              ) : null}
            </div>
            {currentPageDraft.illustrationPrompt ? (
              <div className="mt-4 rounded-[1.25rem] border border-bloom-plum/10 bg-bloom-cream/80 p-4 text-sm text-slate-600">
                <p className="font-semibold text-bloom-ink">Illustration prompt</p>
                <p className="mt-1 leading-6">{currentPageDraft.illustrationPrompt}</p>
              </div>
            ) : null}
          </div>
        </div>
        <PdfExportModal open={Boolean(pdfPreviewUrl)} title={story.title} pdfUrl={pdfPreviewUrl} onClose={closePdfPreview} />
      </div>
    </article>
  );
}
