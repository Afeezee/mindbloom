import Link from 'next/link';
import { Heart, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { type Story } from '@/lib/types';
import { formatDate, getAgeGroupLabel, truncateText } from '@/lib/utils';

interface StoryCardProps {
  story: Story;
}

export function StoryCard({ story }: StoryCardProps) {
  return (
    <Card className="group h-full overflow-hidden border-white/80 bg-white/90 p-0 transition-transform duration-200 hover:-translate-y-1">
      <CardContent className="flex h-full flex-col gap-5 p-6">
        <div className="flex flex-wrap gap-2">
          <Badge variant="plum">{story.theme}</Badge>
          <Badge variant="teal">{getAgeGroupLabel(story.ageGroup)}</Badge>
          {story.isPublic ? <Badge variant="gold">Public</Badge> : null}
        </div>

        <div className="space-y-3">
          <h3 className="text-2xl font-semibold text-bloom-ink">{story.title}</h3>
          <p className="text-sm leading-7 text-slate-600">{truncateText(story.content, 170)}</p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 text-sm text-slate-500">
          <div>
            <p>{formatDate(story.createdAt)}</p>
            <p>{story.wordCount} words</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-bloom-cream px-3 py-2 font-semibold text-bloom-ink">
            <Heart className="h-4 w-4 text-bloom-coral" />
            {story.likeCount}
          </div>
        </div>

        <Link
          href={`/stories/${story.id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-bloom-plum transition group-hover:gap-3"
        >
          Read story
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
