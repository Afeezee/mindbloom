import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import { auth } from '@clerk/nextjs/server';
import { Sparkles, BookText, Flame, Palette } from 'lucide-react';
import { ServiceSetupNotice } from '@/components/setup/ServiceSetupNotice';
import { StoryCard } from '@/components/story/StoryCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { isClerkConfigured } from '@/lib/clerk-server';
import { isSupabaseConfigured, supabaseSetupMessage } from '@/lib/service-config';
import { getStoriesByUser } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { type StoryTheme } from '@/lib/types';

export default async function DashboardPage() {
  if (!isClerkConfigured) {
    return null;
  }

  const [{ userId }, user] = await Promise.all([auth(), currentUser()]);

  if (!userId) {
    return null;
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="section-shell py-8">
        <ServiceSetupNotice
          title="Supabase is not configured for your dashboard yet."
          description={supabaseSetupMessage}
          envVars={['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY']}
        />
      </div>
    );
  }

  const stories = await getStoriesByUser(userId);
  const recentStories = stories.slice(0, 6);
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const storiesThisWeek = stories.filter((story) => new Date(story.createdAt) >= weekStart).length;
  const themeCount = stories.reduce<Record<string, number>>((accumulator, story) => {
    accumulator[story.theme] = (accumulator[story.theme] ?? 0) + 1;
    return accumulator;
  }, {});

  const mostUsedTheme = (Object.entries(themeCount).sort((first, second) => second[1] - first[1])[0]?.[0] ?? 'No stories yet') as StoryTheme | 'No stories yet';
  const firstName = user?.firstName ?? 'Storyteller';

  return (
    <div className="section-shell py-8">
      <section className="rounded-[2rem] bg-gradient-to-br from-bloom-plum via-[#7564d8] to-bloom-teal px-8 py-10 text-white shadow-bloom">
        <p className="text-sm uppercase tracking-[0.28em] text-white/75">Your Library</p>
        <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold md:text-5xl">Welcome back, {firstName}!</h1>
            <p className="mt-4 text-base leading-8 text-white/80">
              Every story tells a new adventure. Keep filling your collection with tales your kids will cherish forever.
            </p>
          </div>
          <Link href="/stories/new">
            <Button className="bg-white text-bloom-plum hover:bg-bloom-cream" size="lg">
              <Sparkles className="h-5 w-5" />
              Create a Story
            </Button>
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Stories Created</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-4xl font-semibold text-bloom-ink">{stories.length}</p>
            <BookText className="h-8 w-8 text-bloom-plum" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>This Week's Magic</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-4xl font-semibold text-bloom-ink">{storiesThisWeek}</p>
            <Flame className="h-8 w-8 text-bloom-coral" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Your Favorite Theme</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div>
              <p className="text-2xl font-semibold text-bloom-ink capitalize">{mostUsedTheme}</p>
              <p className="mt-1 text-sm text-slate-600">Updated {stories[0] ? formatDate(stories[0].createdAt) : 'today'}</p>
            </div>
            <Palette className="h-8 w-8 text-bloom-teal" />
          </CardContent>
        </Card>
      </section>

      <section className="mt-10">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold text-bloom-ink">Your Latest Adventures</h2>
            <p className="mt-2 text-sm text-slate-600">Your newest stories are here. Read them aloud, save favorites, or dive into creating more.</p>
          </div>
          <Link href="/stories" className="text-sm font-semibold text-bloom-plum">
            See all
          </Link>
        </div>

        {recentStories.length === 0 ? (
          <Card>
            <CardContent className="py-14 text-center">
              <p className="text-2xl font-semibold text-bloom-ink">Your story shelf is waiting for its first page.</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Pick a character, choose a setting, and add something magical. That's all it takes to get started.
              </p>
              <div className="mt-6">
                <Link href="/stories/new">
                  <Button>Create My First Story</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
