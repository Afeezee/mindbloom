import { Suspense } from 'react';
import Link from 'next/link';
import { Search, TrendingUp, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getPublicStories } from '@/lib/supabase';
import { type Story } from '@/lib/types';
import { formatDate, getAgeGroupLabel, getLearningFocusLabel, truncateText } from '@/lib/utils';
import { Heart, BookOpen, ArrowRight } from 'lucide-react';

interface DiscoverPageProps {
  searchParams: { q?: string; sort?: string; theme?: string; ageGroup?: string };
}

async function DiscoverGrid({ searchParams }: DiscoverPageProps) {
  const stories = await getPublicStories({
    query: searchParams.q ?? undefined,
    sort: searchParams.sort === 'top' ? 'top' : 'latest',
    theme: searchParams.theme ?? undefined,
    ageGroup: searchParams.ageGroup ?? undefined,
    limit: 48,
  }).catch(() => [] as Story[]);

  if (stories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center text-slate-500">
        <BookOpen className="h-12 w-12 text-bloom-plum/30" />
        <p className="text-lg font-medium">No stories found.</p>
        <p className="text-sm">Be the first to publish one!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {stories.map((story) => (
        <PublicStoryCard key={story.id} story={story} />
      ))}
    </div>
  );
}

function PublicStoryCard({ story }: { story: Story }) {
  return (
    <Link
      href={`/stories/${story.id}`}
      className="group flex flex-col gap-4 overflow-hidden rounded-3xl border border-white/80 bg-white/90 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-bloom"
    >
      {/* Cover image */}
      {story.coverImageUrl ? (
        <div className="overflow-hidden rounded-2xl">
          <img
            src={story.coverImageUrl}
            alt={story.title}
            className="h-44 w-full object-cover transition group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex h-44 items-center justify-center rounded-2xl bg-bloom-cream/80 text-4xl">📚</div>
      )}

      {/* Meta badges */}
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="plum">{getAgeGroupLabel(story.ageGroup)}</Badge>
        {story.learningFocus ? <Badge variant="teal">{getLearningFocusLabel(story.learningFocus)}</Badge> : null}
      </div>

      <h3 className="text-base font-semibold text-bloom-ink leading-snug">{story.title}</h3>
      <p className="text-sm leading-6 text-slate-600 flex-1">{truncateText(story.content, 100)}</p>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{formatDate(story.createdAt)}</span>
        <div className="flex items-center gap-1 rounded-full bg-bloom-cream px-2.5 py-1 font-semibold text-bloom-ink">
          <Heart className="h-3 w-3 text-bloom-coral" />
          {story.likeCount}
        </div>
      </div>

      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-bloom-plum transition group-hover:gap-2.5">
        Read story <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}

export default function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const currentSort = searchParams.sort === 'top' ? 'top' : 'latest';

  function buildHref(overrides: Record<string, string>) {
    const params = new URLSearchParams({
      ...(searchParams.q ? { q: searchParams.q } : {}),
      ...(searchParams.theme ? { theme: searchParams.theme } : {}),
      ...(searchParams.ageGroup ? { ageGroup: searchParams.ageGroup } : {}),
      sort: currentSort,
      ...overrides,
    });
    return `/stories/discover?${params.toString()}`;
  }

  return (
    <div className="section-shell py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-semibold text-bloom-ink">Discover Stories</h1>
        <p className="mt-2 text-base leading-7 text-slate-600">Explore children&rsquo;s books published by the MindBloom community.</p>
      </div>

      {/* Search + tabs */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search form */}
        <form action="/stories/discover" method="GET" className="flex max-w-md items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            name="q"
            defaultValue={searchParams.q ?? ''}
            placeholder="Search by title or story…"
            className="w-full bg-transparent text-sm text-bloom-ink placeholder:text-slate-400 focus:outline-none"
          />
          {searchParams.sort ? <input type="hidden" name="sort" value={searchParams.sort} /> : null}
        </form>

        {/* Sort tabs */}
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          <Link
            href={buildHref({ sort: 'latest' })}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition ${currentSort === 'latest' ? 'bg-bloom-plum text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Clock className="h-4 w-4" />
            Latest
          </Link>
          <Link
            href={buildHref({ sort: 'top' })}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition ${currentSort === 'top' ? 'bg-bloom-plum text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <TrendingUp className="h-4 w-4" />
            Top Stories
          </Link>
        </div>
      </div>

      {/* Stories grid */}
      <Suspense
        fallback={
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-3xl bg-white/80" />
            ))}
          </div>
        }
      >
        <DiscoverGrid searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
