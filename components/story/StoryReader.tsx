"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Share2, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type Story } from '@/lib/types';
import { formatDate, getAgeGroupLabel } from '@/lib/utils';

interface StoryReaderProps {
  story: Story;
  canLike?: boolean;
  backHref?: string;
  publicUrl?: string;
}

export function StoryReader({ story, canLike = true, backHref = '/stories', publicUrl }: StoryReaderProps) {
  const router = useRouter();
  const [likeCount, setLikeCount] = useState(story.likeCount);
  const [liked, setLiked] = useState(Boolean(story.likedByCurrentUser));
  const [isLiking, setIsLiking] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const paragraphs = useMemo(() => story.content.split(/\n{2,}/).filter(Boolean), [story.content]);

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

  return (
    <article className="section-shell py-10">
      <div className="surface-card overflow-hidden p-0">
        <div className="bg-gradient-to-r from-bloom-plum via-[#7f70df] to-bloom-teal px-8 py-10 text-white">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-white/20 text-white" variant="outline">
              {story.theme}
            </Badge>
            <Badge className="bg-white/20 text-white" variant="outline">
              {getAgeGroupLabel(story.ageGroup)}
            </Badge>
            <Badge className="bg-white/20 text-white" variant="outline">
              {formatDate(story.createdAt)}
            </Badge>
          </div>
          <h1 className="mt-5 text-4xl font-semibold md:text-5xl">{story.title}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80">
            {story.wordCount} words • Crafted for gentle reading, strong imagination, and cozy repeat visits.
          </p>
        </div>

        <div className="px-6 py-6 sm:px-8">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={() => router.back()}>
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
            </div>
          </div>

          {shareMessage ? <p className="mb-5 text-sm text-slate-600">{shareMessage}</p> : null}

          <div className="story-prose mx-auto max-w-3xl space-y-8 rounded-[2rem] bg-gradient-to-b from-bloom-cream/60 to-white p-6 md:p-10">
            {paragraphs.map((paragraph, index) => (
              <p key={`${story.id}-paragraph-${index}`} className="text-pretty">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
