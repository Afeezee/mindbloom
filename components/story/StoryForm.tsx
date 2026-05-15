"use client";

import { useMemo, useState } from 'react';
import { AGE_GROUP_OPTIONS, STORY_THEME_OPTIONS, type StoryFormInput } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

interface StoryFormProps {
  onSubmit: (input: StoryFormInput) => Promise<void> | void;
  isSubmitting?: boolean;
  defaultValues?: Partial<StoryFormInput>;
}

export function StoryForm({ onSubmit, isSubmitting = false, defaultValues }: StoryFormProps) {
  const [formState, setFormState] = useState<StoryFormInput>({
    theme: defaultValues?.theme ?? STORY_THEME_OPTIONS[0].value,
    ageGroup: defaultValues?.ageGroup ?? AGE_GROUP_OPTIONS[1].value,
    mainCharacter: defaultValues?.mainCharacter ?? '',
    setting: defaultValues?.setting ?? '',
    specialElement: defaultValues?.specialElement ?? '',
  });

  const selectedAgeGroup = useMemo(
    () => AGE_GROUP_OPTIONS.find((option) => option.value === formState.ageGroup) ?? AGE_GROUP_OPTIONS[1],
    [formState.ageGroup],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      ...formState,
      specialElement: formState.specialElement?.trim() || undefined,
    });
  }

  return (
    <Card className="border-white/90 bg-white/90">
      <CardHeader>
        <CardTitle>Create Your Story</CardTitle>
        <CardDescription>
          Pick a theme, tell us about your child, and add a magical setting. We'll craft the rest.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold text-bloom-ink">
              Theme
              <Select
                aria-label="Select a story theme"
                options={STORY_THEME_OPTIONS.map((theme) => ({ label: theme.label, value: theme.value }))}
                value={formState.theme}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    theme: event.target.value as StoryFormInput['theme'],
                  }))
                }
              />
            </label>

            <label className="space-y-2 text-sm font-semibold text-bloom-ink">
              Age group
              <Select
                aria-label="Select an age group"
                options={AGE_GROUP_OPTIONS.map((option) => ({ label: option.label, value: option.value }))}
                value={formState.ageGroup}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    ageGroup: event.target.value as StoryFormInput['ageGroup'],
                  }))
                }
              />
            </label>
          </div>

          <label className="block space-y-2 text-sm font-semibold text-bloom-ink">
            Main character
            <Input
              aria-label="Main character"
              placeholder="Mina the moon-gazing fox"
              required
              value={formState.mainCharacter}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  mainCharacter: event.target.value,
                }))
              }
            />
          </label>

          <label className="block space-y-2 text-sm font-semibold text-bloom-ink">
            Setting
            <Input
              aria-label="Story setting"
              placeholder="A lantern-lit forest library"
              required
              value={formState.setting}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  setting: event.target.value,
                }))
              }
            />
          </label>

          <label className="block space-y-2 text-sm font-semibold text-bloom-ink">
            Special element
            <Input
              aria-label="Optional special element"
              placeholder="Optional: a humming pocket watch"
              value={formState.specialElement ?? ''}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  specialElement: event.target.value,
                }))
              }
            />
          </label>

          <div className="rounded-[1.5rem] bg-bloom-cream p-4 text-sm text-slate-700">
            <p className="font-semibold text-bloom-ink">Age-group writing hint</p>
            <p className="mt-2 leading-6">{selectedAgeGroup.guidance}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
              Prompt detail count: {(formState.mainCharacter + formState.setting + (formState.specialElement ?? '')).trim().length} characters
            </p>
          </div>

          <Button className="w-full" size="lg" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Weaving your story...' : 'Create My Story'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
