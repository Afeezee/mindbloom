import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { clerkSetupMessage, isClerkConfigured } from '@/lib/clerk-server';
import { groqSetupMessage, isGroqConfigured, isSupabaseConfigured, supabaseSetupMessage } from '@/lib/service-config';
import { AgeGroup, StoryTheme } from '@/lib/types';
import { buildPromptUsed, generateStoryTitle } from '@/lib/groq';
import { saveStory } from '@/lib/supabase';

const generationParamsSchema = z.object({
  theme: z.nativeEnum(StoryTheme),
  ageGroup: z.nativeEnum(AgeGroup),
  mainCharacter: z.string().trim().min(2).max(80),
  setting: z.string().trim().min(2).max(120),
  specialElement: z.string().trim().max(120).optional(),
});

const saveStorySchema = z.object({
  title: z.string().trim().max(120).optional(),
  content: z.string().trim().min(100),
  ageGroup: z.nativeEnum(AgeGroup),
  theme: z.nativeEnum(StoryTheme),
  characters: z.array(z.string().trim().min(1)).min(1),
  coverImageUrl: z.string().url().nullable().optional(),
  isPublic: z.boolean().optional(),
  generationParams: generationParamsSchema,
});

export async function POST(request: Request) {
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
    const parsedPayload = saveStorySchema.safeParse(payload);

    if (!parsedPayload.success) {
      return Response.json(
        {
          error: 'Invalid save request.',
          issues: parsedPayload.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { content, title, ageGroup, theme, characters, coverImageUrl, isPublic, generationParams } = parsedPayload.data;

    if ((!title || title.length === 0) && !isGroqConfigured) {
      return Response.json({ error: groqSetupMessage }, { status: 503 });
    }

    const resolvedTitle = title && title.length > 0 ? title : await generateStoryTitle(content);
    const story = await saveStory({
      userId,
      title: resolvedTitle,
      content,
      promptUsed: buildPromptUsed(generationParams),
      ageGroup,
      theme,
      characters,
      coverImageUrl: coverImageUrl ?? null,
      isPublic,
    });

    return Response.json({ story }, { status: 201 });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Unexpected story save error.',
      },
      { status: 500 },
    );
  }
}
