import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { clerkSetupMessage, isClerkConfigured } from '@/lib/clerk-server';
import { groqSetupMessage, isGroqConfigured, isSupabaseConfigured, supabaseSetupMessage } from '@/lib/service-config';
import { AgeGroup, BookSize, LearningFocus } from '@/lib/types';
import { generateStoryOutline } from '@/lib/groq';

const outlineRequestSchema = z.object({
  title: z.string().trim().min(2).max(120),
  storyIdea: z.string().trim().min(5).max(1000),
  pageCount: z.number().int().min(1).max(50),
  ageGroup: z.nativeEnum(AgeGroup),
  learningFocus: z.nativeEnum(LearningFocus),
  bookSize: z.nativeEnum(BookSize),
});

export async function POST(request: Request) {
  if (!isClerkConfigured) {
    return Response.json({ error: clerkSetupMessage }, { status: 503 });
  }

  if (!isGroqConfigured) {
    return Response.json({ error: groqSetupMessage }, { status: 503 });
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
    const parsedPayload = outlineRequestSchema.safeParse(payload);

    if (!parsedPayload.success) {
      return Response.json(
        {
          error: 'Invalid outline request.',
          issues: parsedPayload.error.flatten(),
        },
        { status: 400 },
      );
    }

    const outline = await generateStoryOutline(parsedPayload.data);

    return Response.json({ outline }, { status: 200 });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Unexpected outline generation error.',
      },
      { status: 500 },
    );
  }
}
