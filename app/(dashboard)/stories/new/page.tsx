import { currentUser } from '@clerk/nextjs/server';
import { NewStoryFlow } from '@/components/story/NewStoryFlow';

function buildAuthorName(firstName?: string | null, lastName?: string | null, fullName?: string | null) {
  const combinedName = [firstName, lastName].filter(Boolean).join(' ').trim();

  return fullName?.trim() || combinedName || 'the writer';
}

export default async function NewStoryPage() {
  const user = await currentUser();

  return <NewStoryFlow authorName={buildAuthorName(user?.firstName, user?.lastName, user?.fullName)} />;
}