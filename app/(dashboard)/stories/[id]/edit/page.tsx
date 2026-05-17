import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import { ClerkSetupNotice } from '@/components/auth/ClerkSetupNotice';
import { ServiceSetupNotice } from '@/components/setup/ServiceSetupNotice';
import { StoryStudio } from '@/components/story/StoryStudio';
import { isClerkConfigured } from '@/lib/clerk-server';
import { isSupabaseConfigured, supabaseSetupMessage } from '@/lib/service-config';
import { getStoryById } from '@/lib/supabase';

interface StoryStudioPageProps {
  params: {
    id: string;
  };
}

export const dynamic = 'force-dynamic';

export default async function StoryStudioPage({ params }: StoryStudioPageProps) {
  if (!isClerkConfigured) {
    return (
      <div className="section-shell py-8">
        <ClerkSetupNotice title="Story Studio is waiting on Clerk setup." />
      </div>
    );
  }

  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="section-shell py-8">
        <ClerkSetupNotice title="Sign in to edit this story." />
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="section-shell py-8">
        <ServiceSetupNotice
          title="Supabase is not configured for Story Studio yet."
          description={supabaseSetupMessage}
          envVars={['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY']}
        />
      </div>
    );
  }

  const story = await getStoryById(params.id, userId);

  if (!story || story.userId !== userId) {
    notFound();
  }

  return <StoryStudio story={story} />;
}
