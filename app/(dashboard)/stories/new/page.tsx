"use client";

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { StoryForm } from '@/components/story/StoryForm';
import { MagicLoadingScreen } from '@/components/story/MagicLoadingScreen';
import { StoryOutlinePreview } from '@/components/story/StoryOutlinePreview';
import { BookReveal } from '@/components/story/BookReveal';
import {
  type BookDraft,
  type CharacterDescription,
  type StoryBuilderInput,
  type StoryOutline,
} from '@/lib/types';

type CreationStep = 'form' | 'outline-loading' | 'outline-preview' | 'book-loading' | 'reveal';

function buildBookContent(bookDraft: BookDraft) {
  return bookDraft.pages
    .map((page) => `Page ${page.pageNumber}\n\n${page.text}`)
    .join('\n\n--- PAGE ---\n\n');
}

function buildIllustrationUrl(prompt: string, seed: number, model = 'flux') {
  const search = new URLSearchParams({
    prompt,
    seed: String(seed),
    model,
    width: '768',
    height: '1024',
    safe: 'privacy,secrets',
  });
  return `/api/illustration?${search.toString()}`;
}

function buildAuthorName(firstName?: string | null, lastName?: string | null, fullName?: string | null) {
  const combinedName = [firstName, lastName].filter(Boolean).join(' ').trim();

  return fullName?.trim() || combinedName || 'the writer';
}

function buildCoverPrompt(title: string, authorName: string, coverImagePrompt: string, characterDescriptions: CharacterDescription[]) {
  const characterSheet = characterDescriptions
    .map((character) => `${character.name} (${character.appearance})`)
    .join('; ');

  return [
    `Create a polished children's book cover illustration for "${title.trim()}" by ${authorName}.`,
    'Show the main character or characters against the backdrop and setting described in the story.',
    characterSheet.length > 0 ? `Character details: ${characterSheet}.` : null,
    `Scene guidance: ${coverImagePrompt.trim()}.`,
    `Include the title text "${title.trim()}" in large bold lettering at the top of the cover and "by ${authorName}" beneath it.`,
    'Portrait composition, vibrant colors, clean readable book-cover layout, warm children's-book style, no extra captions.',
  ]
    .filter((value): value is string => Boolean(value))
    .join(' ');
}

function preloadImage(url: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
}

export default function NewStoryPage() {
  const { user } = useUser();
  const [step, setStep] = useState<CreationStep>('form');
  const [input, setInput] = useState<StoryBuilderInput | null>(null);
  const [outline, setOutline] = useState<StoryOutline | null>(null);
  const [draft, setDraft] = useState<BookDraft | null>(null);
  const [savedStoryId, setSavedStoryId] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFormSubmit(formInput: StoryBuilderInput) {
    setInput(formInput);
    setOutline(null);
    setDraft(null);
    setSavedStoryId(null);
    setError(null);
    setStep('outline-loading');

    try {
      const response = await fetch('/api/generate-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formInput),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? 'Unable to generate the story outline.');
      }

      const payload = (await response.json()) as { outline: StoryOutline };
      setOutline(payload.outline);
      setStep('outline-preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate the story outline.');
      setStep('form');
    }
  }

  async function handleGenerateBook() {
    if (!input || !outline) return;
    setError(null);
    setStep('book-loading');

    try {
      const characters: CharacterDescription[] = outline.characters;

      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, characters }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? 'Unable to generate the full story.');
      }

      const payload = (await response.json()) as { draft: BookDraft };
      const authorName = buildAuthorName(user?.firstName, user?.lastName, user?.fullName);

      const hydratedDraft: BookDraft = {
        ...payload.draft,
        pages: payload.draft.pages.map((page, index) => ({
          ...page,
          imageUrl: buildIllustrationUrl(page.illustrationPrompt, index + 1),
        })),
      };

      const coverUrl = buildIllustrationUrl(
        buildCoverPrompt(hydratedDraft.title, authorName, hydratedDraft.coverImagePrompt, outline.characters),
        0,
      );
      setCoverImageUrl(coverUrl);

      await Promise.all([
        preloadImage(coverUrl),
        ...hydratedDraft.pages.slice(0, 3).map((page) => preloadImage(page.imageUrl ?? '')),
      ]);

      setDraft(hydratedDraft);

      const content = buildBookContent(hydratedDraft);
      const saveResponse = await fetch('/api/save-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: hydratedDraft.title,
          content,
          ageGroup: input.ageGroup,
          theme: hydratedDraft.theme,
          learningFocus: input.learningFocus,
          bookSize: input.bookSize,
          pageCount: input.pageCount,
          bookPages: hydratedDraft.pages,
          characters: hydratedDraft.characters.length > 0 ? hydratedDraft.characters : [hydratedDraft.title],
          coverImageUrl: coverUrl,
          generationParams: input,
        }),
      });

      if (!saveResponse.ok) {
        const savePayload = (await saveResponse.json().catch(() => null)) as { error?: string; issues?: unknown } | null;
        console.error('Auto-save failed:', savePayload);
        throw new Error(savePayload?.error ?? 'Unable to save story to your account.');
      }

      const saveData = (await saveResponse.json()) as { story: { id: string } };
      setSavedStoryId(saveData.story.id);
      setStep('reveal');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate the story.');
      setStep('outline-preview');
    }
  }

  function handleCreateAnother() {
    setStep('form');
    setInput(null);
    setOutline(null);
    setDraft(null);
    setSavedStoryId(null);
    setCoverImageUrl(null);
    setError(null);
  }

  if (step === 'outline-loading') return <MagicLoadingScreen phase="outline" />;
  if (step === 'book-loading') return <MagicLoadingScreen phase="book" />;

  if (step === 'outline-preview' && outline) {
    return (
      <StoryOutlinePreview
        outline={outline}
        onConfirm={handleGenerateBook}
        onBack={() => setStep('form')}
      />
    );
  }

  if (step === 'reveal' && draft && savedStoryId && coverImageUrl) {
    return (
      <BookReveal
        draft={draft}
        savedStoryId={savedStoryId}
        coverImageUrl={coverImageUrl}
        authorName={buildAuthorName(user?.firstName, user?.lastName, user?.fullName)}
        onCreateAnother={handleCreateAnother}
      />
    );
  }

  return (
    <div className="section-shell py-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm uppercase tracking-[0.28em] text-bloom-teal">Step 1 of 3</p>
        <h1 className="mt-2 text-4xl font-semibold text-bloom-ink">Let&rsquo;s build a children&rsquo;s book</h1>
        <p className="mt-3 text-base leading-7 text-slate-600">
          Fill in the details below. We&rsquo;ll show you a story outline to review before generating the full illustrated book.
        </p>
        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}
      </div>
      <StoryForm onSubmit={handleFormSubmit} isSubmitting={false} />
    </div>
  );
}
