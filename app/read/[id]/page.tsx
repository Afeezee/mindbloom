import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ServiceSetupNotice } from '@/components/setup/ServiceSetupNotice';
import { StoryReader } from '@/components/story/StoryReader';
import { isSupabaseConfigured, supabaseSetupMessage } from '@/lib/service-config';
import { getStoryById } from '@/lib/supabase';
import { truncateText } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface PublicStoryPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PublicStoryPageProps): Promise<Metadata> {
  if (!isSupabaseConfigured) {
    return {
      title: 'Story storage not configured | MindBloom',
    };
  }

  const story = await getStoryById(params.id);

  if (!story || !story.isPublic) {
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

export default async function PublicStoryPage({ params }: PublicStoryPageProps) {
  if (!isSupabaseConfigured) {
    return (
      <main className="py-8">
        <div className="section-shell">
          <ServiceSetupNotice
            title="Supabase is not configured for public story reads yet."
            description={supabaseSetupMessage}
            envVars={['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY']}
          />
        </div>
      </main>
    );
  }

  const story = await getStoryById(params.id);

  if (!story || !story.isPublic) {
    notFound();
  }

  return (
    <main className="py-8">
      <div className="section-shell mb-4 flex items-center justify-between">
        <Link href="/sign-in" className="text-sm font-semibold text-bloom-plum">
          Create your own magical stories
        </Link>
      </div>
      <StoryReader story={story} canLike={false} backHref="/sign-in" publicUrl={`/read/${story.id}`} />
    </main>
  );
}
