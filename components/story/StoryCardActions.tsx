"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface StoryCardActionsProps {
  storyId: string;
  isPublic: boolean;
}

export function StoryCardActions({ storyId, isPublic }: StoryCardActionsProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleTogglePublish() {
    setIsPublishing(true);
    setError(null);

    try {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPublic: !isPublic,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? 'Unable to update publish status.');
      }
      window.location.reload();
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : 'Unable to update publish status.');
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/stories/${storyId}/edit`}>
          <Button variant="outline" size="sm">
            Edit
          </Button>
        </Link>
        <Link href={`/stories/${storyId}`}>
          <Button variant="secondary" size="sm">
            Preview
          </Button>
        </Link>
        <Button variant={isPublic ? 'outline' : 'primary'} size="sm" disabled={isPublishing} onClick={handleTogglePublish}>
          {isPublishing ? 'Saving...' : isPublic ? 'Unpublish' : 'Publish'}
        </Button>
      </div>
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
