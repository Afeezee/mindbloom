import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import { ServiceSetupNotice } from '@/components/setup/ServiceSetupNotice';
import { StoryReader } from '@/components/story/StoryReader';
import { isClerkConfigured } from '@/lib/clerk-server';
import { isSupabaseConfigured, supabaseSetupMessage } from '@/lib/service-config';
import { getStoryById } from '@/lib/supabase';
import { truncateText } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface StoryPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  if (!isSupabaseConfigured) {
    return {
      title: 'Story storage not configured | MindBloom',
    };
  }

  const story = await getStoryById(params.id);

  if (!story) {
    return {
      title: 'Story not found | MindBloom',
    };
  }

  const description = truncateText(story.content, 160);

  return {
    title: `${story.title} | MindBloom`,
    description,
    openGraph: {
      title: story.title,
      description,
    },
  };
}

export default async function StoryPage({ params }: StoryPageProps) {
  if (!isClerkConfigured) {
    return null;
  }

  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="section-shell py-8">
        <ServiceSetupNotice
          title="Supabase is not configured for story reads yet."
          description={supabaseSetupMessage}
          envVars={['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY']}
        />
      </div>
    );
  }

  const story = await getStoryById(params.id, userId ?? undefined);

  if (!story) {
    notFound();
  }

  return <StoryReader story={story} publicUrl={story.isPublic ? `/read/${story.id}` : undefined} />;
}
