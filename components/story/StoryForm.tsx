"use client";

import { useMemo, useState } from 'react';
import {
  AGE_GROUP_OPTIONS,
  BOOK_LENGTH_PRESETS,
  BOOK_SIZE_OPTIONS,
  LEARNING_FOCUS_OPTIONS,
  type StoryBuilderInput,
} from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface StoryFormProps {
  onSubmit: (input: StoryBuilderInput) => Promise<void> | void;
  isSubmitting?: boolean;
  defaultValues?: Partial<StoryBuilderInput>;
}

export function StoryForm({ onSubmit, isSubmitting = false, defaultValues }: StoryFormProps) {
  const [formState, setFormState] = useState<StoryBuilderInput>({
    title: defaultValues?.title ?? '',
    storyIdea: defaultValues?.storyIdea ?? '',
    pageCount: defaultValues?.pageCount ?? BOOK_LENGTH_PRESETS[0].value,
    ageGroup: defaultValues?.ageGroup ?? AGE_GROUP_OPTIONS[1].value,
    learningFocus: defaultValues?.learningFocus ?? LEARNING_FOCUS_OPTIONS[0].value,
    bookSize: defaultValues?.bookSize ?? BOOK_SIZE_OPTIONS[0].value,
  });

  const selectedAgeGroup = useMemo(
    () => AGE_GROUP_OPTIONS.find((option) => option.value === formState.ageGroup) ?? AGE_GROUP_OPTIONS[1],
    [formState.ageGroup],
  );

  const selectedLengthLabel = useMemo(
    () => BOOK_LENGTH_PRESETS.find((preset) => preset.value === formState.pageCount)?.label ?? 'Custom',
    [formState.pageCount],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      ...formState,
      title: formState.title.trim(),
      storyIdea: formState.storyIdea.trim(),
    });
  }

  return (
    <Card className="border-white/90 bg-white/90">
      <CardHeader>
        <CardTitle>Create Your Book</CardTitle>
        <CardDescription>
          Build the story in the order a real book is made: title, idea, length, age group, learning focus, and size.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block space-y-2 text-sm font-semibold text-bloom-ink">
            Story title
            <Input
              aria-label="Story title"
              placeholder="The Lantern Library"
              required
              value={formState.title}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
            />
          </label>

          <label className="block space-y-2 text-sm font-semibold text-bloom-ink">
            Story idea
            <Textarea
              aria-label="Story idea"
              placeholder="A shy inventor learns to share her ideas with a classroom of curious friends..."
              required
              value={formState.storyIdea}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  storyIdea: event.target.value,
                }))
              }
            />
          </label>

          <div className="space-y-3 rounded-[1.5rem] border border-bloom-plum/10 bg-bloom-cream/60 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-bloom-ink">Book length</p>
                <p className="text-xs text-slate-600">Slide from a quick story to an epic adventure. Max 50 pages.</p>
              </div>
              <p className="text-lg font-semibold text-bloom-plum">{formState.pageCount} pages</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {BOOK_LENGTH_PRESETS.map((preset) => {
                const active = formState.pageCount === preset.value;

                return (
                  <button
                    key={preset.value}
                    type="button"
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      active
                        ? 'border-bloom-plum bg-white text-bloom-ink shadow-soft'
                        : 'border-bloom-plum/15 bg-white/70 text-slate-600 hover:border-bloom-plum/35'
                    }`}
                    onClick={() =>
                      setFormState((current) => ({
                        ...current,
                        pageCount: preset.value,
                      }))
                    }
                  >
                    <p className="text-sm font-semibold">{preset.label}</p>
                    <p className="mt-1 text-xs leading-5">{preset.description}</p>
                  </button>
                );
              })}
            </div>

            <input
              aria-label="Book length slider"
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-bloom-plum/15 accent-bloom-plum"
              min={8}
              max={50}
              step={1}
              type="range"
              value={formState.pageCount}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  pageCount: Number(event.target.value),
                }))
              }
            />
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Quick</span>
              <span>{selectedLengthLabel}</span>
              <span>Epic</span>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold text-bloom-ink">
              Age group
              <Select
                aria-label="Select an age group"
                options={AGE_GROUP_OPTIONS.map((option) => ({ label: option.label, value: option.value }))}
                value={formState.ageGroup}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    ageGroup: event.target.value as StoryBuilderInput['ageGroup'],
                  }))
                }
              />
            </label>

            <label className="space-y-2 text-sm font-semibold text-bloom-ink">
              Learning focus
              <Select
                aria-label="Select a learning focus"
                options={LEARNING_FOCUS_OPTIONS.map((option) => ({ label: option.label, value: option.value }))}
                value={formState.learningFocus}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    learningFocus: event.target.value as StoryBuilderInput['learningFocus'],
                  }))
                }
              />
            </label>
          </div>

          <label className="space-y-2 text-sm font-semibold text-bloom-ink">
            Book size
            <Select
              aria-label="Select a book size"
              options={BOOK_SIZE_OPTIONS.map((option) => ({ label: option.label, value: option.value }))}
              value={formState.bookSize}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  bookSize: event.target.value as StoryBuilderInput['bookSize'],
                }))
              }
            />
          </label>

          <div className="rounded-[1.5rem] bg-bloom-cream p-4 text-sm text-slate-700">
            <p className="font-semibold text-bloom-ink">Age-group writing hint</p>
            <p className="mt-2 leading-6">{selectedAgeGroup.guidance}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">{selectedLengthLabel} selected</p>
          </div>

          <Button className="w-full" size="lg" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Generating your book...' : 'Generate my Story'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
