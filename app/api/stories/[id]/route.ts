import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { clerkSetupMessage, isClerkConfigured } from '@/lib/clerk-server';
import { isSupabaseConfigured, supabaseSetupMessage } from '@/lib/service-config';
import { getStoryById, updateStory } from '@/lib/supabase';

const updateStorySchema = z.object({
  title: z.string().trim().min(2).max(120).optional(),
  content: z.string().trim().min(100).optional(),
  isPublic: z.boolean().optional(),
});

interface StoryRouteContext {
  params: {
    id: string;
  };
}

export async function PATCH(request: Request, { params }: StoryRouteContext) {
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
    const payload = await request.json();
    const parsedPayload = updateStorySchema.safeParse(payload);

    if (!parsedPayload.success) {
      return Response.json(
        {
          error: 'Invalid story update request.',
          issues: parsedPayload.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { title, content, isPublic } = parsedPayload.data;

    if (title === undefined && content === undefined && isPublic === undefined) {
      return Response.json({ error: 'No update fields provided.' }, { status: 400 });
    }

    const story = await updateStory(params.id, userId, {
      title,
      content,
      isPublic,
    });

    return Response.json({ story }, { status: 200 });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Unexpected story update error.',
      },
      { status: 500 },
    );
  }
}

export async function GET(_request: Request, { params }: StoryRouteContext) {
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
    const story = await getStoryById(params.id, userId);

    if (!story || story.userId !== userId) {
      return Response.json({ error: 'Story not found.' }, { status: 404 });
    }

    return Response.json({ story }, { status: 200 });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Unexpected story read error.',
      },
      { status: 500 },
    );
  }
}
