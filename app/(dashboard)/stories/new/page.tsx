"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StoryForm } from '@/components/story/StoryForm';
import { StreamingText } from '@/components/story/StreamingText';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type StoryFormInput, type StoryGenerationParams } from '@/lib/types';

export default function NewStoryPage() {
  const router = useRouter();
  const [request, setRequest] = useState<StoryGenerationParams | null>(null);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(input: StoryFormInput) {
    setError(null);
    setGeneratedContent('');
    setRequest(input);
    setIsGenerating(true);
  }

  async function handleSave() {
    if (!request || !generatedContent.trim()) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/save-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: generatedContent,
          ageGroup: request.ageGroup,
          theme: request.theme,
          characters: [request.mainCharacter],
          generationParams: request,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? 'Unable to save the story.');
      }

      const payload = (await response.json()) as { story: { id: string } };
      router.push(`/stories/${payload.story.id}`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save the story.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="section-shell py-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm uppercase tracking-[0.28em] text-bloom-teal">Create a Story</p>
        <h1 className="mt-2 text-4xl font-semibold text-bloom-ink">Let's weave a tale</h1>
        <p className="mt-3 text-base leading-7 text-slate-600">
          Tell us the details, and watch as your story comes to life word by word. The preview appears on the right as we write.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <StoryForm onSubmit={handleGenerate} isSubmitting={isGenerating} />

        <div className="space-y-5">
          <StreamingText
            request={request}
            onComplete={(text) => {
              setGeneratedContent(text);
              setIsGenerating(false);
            }}
            onError={(message) => {
              setError(message);
              setIsGenerating(false);
            }}
          />

          <Card>
            <CardHeader>
              <CardTitle>Ready to keep this story?</CardTitle>
              <CardDescription>
                Save it to your library so you can read it, share it, and treasure it forever.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
              <Button onClick={handleSave} disabled={!generatedContent.trim() || isGenerating || isSaving}>
                {isSaving ? 'Saving...' : 'Save This Story'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
