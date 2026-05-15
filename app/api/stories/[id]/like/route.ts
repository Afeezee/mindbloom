import { auth } from '@clerk/nextjs/server';
import { clerkSetupMessage, isClerkConfigured } from '@/lib/clerk-server';
import { isSupabaseConfigured, supabaseSetupMessage } from '@/lib/service-config';
import { toggleLike } from '@/lib/supabase';

interface LikeRouteContext {
  params: {
    id: string;
  };
}

export async function POST(_request: Request, { params }: LikeRouteContext) {
  if (!isClerkConfigured) {
    return Response.json({ error: clerkSetupMessage }, { status: 503 });
  }

  if (!isSupabaseConfigured) {
    return Response.json({ error: supabaseSetupMessage }, { status: 503 });
  }

  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const result = await toggleLike(params.id, userId);
    return Response.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to toggle the like.';
    const status = message.includes('not found') ? 404 : 500;

    return Response.json({ error: message }, { status });
  }
}
