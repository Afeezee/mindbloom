import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ClerkSetupNotice } from '@/components/auth/ClerkSetupNotice';
import { ServiceSetupNotice } from '@/components/setup/ServiceSetupNotice';
import { Select } from '@/components/ui/select';
import { StoryCard } from '@/components/story/StoryCard';
import { isClerkConfigured } from '@/lib/clerk-server';
import { isSupabaseConfigured, supabaseSetupMessage } from '@/lib/service-config';
import { AGE_GROUP_OPTIONS, StoryTheme, type AgeGroup } from '@/lib/types';
import { getStoriesByUser } from '@/lib/supabase';

interface StoriesPageProps {
  searchParams: {
    theme?: string;
    ageGroup?: string;
  };
}

export default async function StoriesPage({ searchParams }: StoriesPageProps) {
  if (!isClerkConfigured) {
    return (
      <div className="section-shell py-8">
        <ClerkSetupNotice title="Your story library is waiting on Clerk setup." />
      </div>
    );
  }

  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="section-shell py-8">
        <ClerkSetupNotice title="Sign in to view your story library." />
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="section-shell py-8">
        <ServiceSetupNotice
          title="Supabase is not configured for your story library yet."
          description={supabaseSetupMessage}
          envVars={['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY']}
        />
      </div>
    );
  }

  const selectedTheme = Object.values(StoryTheme).includes(searchParams.theme as StoryTheme)
    ? (searchParams.theme as StoryTheme)
    : undefined;
  const selectedAgeGroup = AGE_GROUP_OPTIONS.some((option) => option.value === searchParams.ageGroup)
    ? (searchParams.ageGroup as AgeGroup)
    : undefined;

  const stories = await getStoriesByUser(userId, {
    theme: selectedTheme,
    ageGroup: selectedAgeGroup,
  });

  return (
    <div className="section-shell py-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-bloom-teal">Your Collection</p>
          <h1 className="mt-2 text-4xl font-semibold text-bloom-ink">Your Story Shelf</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            {stories.length} {stories.length === 1 ? 'magical tale' : 'magical tales'} waiting to be shared.
          </p>
        </div>
        <Link href="/stories/new">
          <Button size="lg">Create a New Story</Button>
        </Link>
      </div>

      <Card className="mt-8">
        <CardContent className="flex flex-col gap-4 pt-6 md:flex-row md:items-end md:justify-between">
          <form className="grid flex-1 gap-4 md:grid-cols-2" method="GET">
            <label className="space-y-2 text-sm font-semibold text-bloom-ink">
              Filter by theme
              <Select
                defaultValue={selectedTheme ?? 'all'}
                name="theme"
                options={[
                  { label: 'All themes', value: 'all' },
                  ...Object.values(StoryTheme).map((theme) => ({ label: theme, value: theme })),
                ]}
              />
            </label>
            <label className="space-y-2 text-sm font-semibold text-bloom-ink">
              Filter by age group
              <Select
                defaultValue={selectedAgeGroup ?? 'all'}
                name="ageGroup"
                options={[
                  { label: 'All age groups', value: 'all' },
                  ...AGE_GROUP_OPTIONS.map((option) => ({ label: option.label, value: option.value })),
                ]}
              />
            </label>
            <div className="md:col-span-2">
              <Button variant="secondary" type="submit">
                Filter
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {stories.length === 0 ? (
        <Card className="mt-8 border-dashed border-bloom-plum/30 bg-white/80">
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-bloom-cream text-4xl">
              📚
            </div>
            <h2 className="text-3xl font-semibold text-bloom-ink">Your shelf is empty</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600">
              Every great story starts with a single idea. Create your first tale and begin building a collection your family will treasure.
            </p>
            <div className="mt-8">
              <Link href="/stories/new">
                <Button>Create My First Story</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  );
}
